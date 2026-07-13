type PulseKind = "click" | "drop";

type Layer = {
  current: Float32Array;
  previous: Float32Array;
  damping: number;
};

const VERTEX_SHADER = `
attribute vec2 aPosition;
uniform vec2 uResolution;
varying vec2 vPixel;

void main() {
  vec2 uv = aPosition * 0.5 + 0.5;
  vPixel = vec2(uv.x * uResolution.x, (1.0 - uv.y) * uResolution.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `
precision highp float;

uniform sampler2D uWallpaper;
uniform sampler2D uField;
uniform vec2 uResolution;
uniform vec2 uImageSize;
uniform vec2 uFieldSize;
uniform float uFieldDown;
uniform float uFieldRange;
uniform float uRefraction;
uniform float uMaxOffset;
uniform float uMinGradient;
uniform float uCellSize;
uniform float uGridAlpha;
uniform float uHasImage;
varying vec2 vPixel;

float fieldValue(vec2 uv) {
  return (texture2D(uField, clamp(uv, vec2(0.001), vec2(0.999))).r * 2.0 - 1.0) * uFieldRange;
}

vec2 displacement(vec2 pixel) {
  vec2 uv = (pixel / uFieldDown + vec2(0.5)) / uFieldSize;
  vec2 texel = 1.0 / uFieldSize;
  float h = fieldValue(uv);
  float gx = fieldValue(uv + vec2(texel.x, 0.0)) - fieldValue(uv - vec2(texel.x, 0.0));
  float gy = fieldValue(uv + vec2(0.0, texel.y)) - fieldValue(uv - vec2(0.0, texel.y));
  float energy = clamp((length(vec2(gx, gy)) - uMinGradient) * 7.2 + abs(h) * 1.85, 0.0, 1.0);
  return clamp(vec2(gx, gy * 0.72) * uRefraction * energy, vec2(-uMaxOffset), vec2(uMaxOffset));
}

vec2 coverUv(vec2 pixel) {
  float scale = max(uResolution.x / uImageSize.x, uResolution.y / uImageSize.y);
  vec2 rendered = uImageSize * scale;
  vec2 crop = vec2((rendered.x - uResolution.x) * 0.5, 0.0);
  return clamp((pixel + crop) / rendered, vec2(0.0), vec2(1.0));
}

float gridMask(vec2 pixel) {
  vec2 cell = fract(pixel / uCellSize);
  float edge = min(min(cell.x, 1.0 - cell.x), min(cell.y, 1.0 - cell.y)) * uCellSize;
  float fade = 1.0 - smoothstep(0.5, 0.77, pixel.y / uResolution.y);
  return (1.0 - smoothstep(1.1, 2.0, edge)) * fade;
}

void main() {
  if (uHasImage < 0.5) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec2 cellCenter = (floor(vPixel / uCellSize) + vec2(0.5)) * uCellSize;
  vec2 wave = displacement(vPixel);
  vec2 cellWave = displacement(cellCenter);
  float verticalBlend = 1.0 - smoothstep(0.5, 0.75, vPixel.y / uResolution.y);
  vec2 sourcePixel = vPixel - mix(wave, cellWave, verticalBlend);
  vec3 color = texture2D(uWallpaper, coverUv(sourcePixel)).rgb;
  float warped = clamp(length(cellWave) / max(1.0, uMaxOffset), 0.0, 1.0);
  float grid = gridMask(vPixel) * uGridAlpha * mix(1.2, 1.6, warped);
  color = mix(color, color * 0.67 + vec3(0.045, 0.075, 0.085), grid);
  gl_FragColor = vec4(color, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("无法创建水面着色器");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || "水面着色器编译失败";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function programFor(gl: WebGLRenderingContext) {
  const program = gl.createProgram();
  if (!program) throw new Error("无法创建水面程序");
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || "水面程序链接失败";
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
}

export class WaterRefraction {
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGLRenderingContext;
  private readonly program: WebGLProgram;
  private readonly fieldTexture: WebGLTexture;
  private readonly wallpaperTexture: WebGLTexture;
  private width = 0;
  private height = 0;
  private down = 5;
  private fieldWidth = 8;
  private fieldHeight = 8;
  private impulse: Layer = { current: new Float32Array(64), previous: new Float32Array(64), damping: 0.988 };
  private movement: Layer = { current: new Float32Array(64), previous: new Float32Array(64), damping: 0.92 };
  private encoded = new Uint8Array(64);
  private imageWidth = 1;
  private imageHeight = 1;
  private imageReady = false;
  private destroyed = false;
  private lastStep = 0;
  private lastMove: { x: number; y: number } | null = null;
  private secondPulses = new Set<number>();

  constructor(canvas: HTMLCanvasElement, imageUrl: string) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: true,
      premultipliedAlpha: false,
    });
    if (!gl) throw new Error("此浏览器不支持 WebGL 水面折射");
    this.gl = gl;
    this.program = programFor(gl);

    const fieldTexture = gl.createTexture();
    const wallpaperTexture = gl.createTexture();
    const buffer = gl.createBuffer();
    if (!fieldTexture || !wallpaperTexture || !buffer) throw new Error("无法分配水面纹理");
    this.fieldTexture = fieldTexture;
    this.wallpaperTexture = wallpaperTexture;

    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(this.program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.STENCIL_TEST);

    this.configureTexture(fieldTexture, 1);
    this.configureTexture(wallpaperTexture, 0);
    this.uniform1i("uWallpaper", 0);
    this.uniform1i("uField", 1);

    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (this.destroyed) return;
      this.imageWidth = image.naturalWidth;
      this.imageHeight = image.naturalHeight;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.wallpaperTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      this.imageReady = true;
      canvas.dataset.ready = "true";
    };
    image.src = imageUrl;
  }

  private configureTexture(texture: WebGLTexture, unit: number) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  resize(width: number, height: number, dpr: number, mobile: boolean) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.down = mobile ? 6 : 5;
    this.fieldWidth = Math.max(8, Math.ceil(this.width / this.down));
    this.fieldHeight = Math.max(8, Math.ceil(this.height / this.down));
    const cells = this.fieldWidth * this.fieldHeight;
    this.impulse = { current: new Float32Array(cells), previous: new Float32Array(cells), damping: 0.988 };
    this.movement = { current: new Float32Array(cells), previous: new Float32Array(cells), damping: 0.92 };
    this.encoded = new Uint8Array(cells);
    this.encoded.fill(128);
    this.lastMove = null;

    const pixelRatio = Math.min(dpr, mobile ? 1.25 : 2);
    this.canvas.width = Math.max(1, Math.round(width * pixelRatio));
    this.canvas.height = Math.max(1, Math.round(height * pixelRatio));
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  move(x: number, y: number) {
    if (y < 0 || y > this.height) {
      this.lastMove = null;
      return;
    }
    const previous = this.lastMove;
    this.lastMove = { x, y };
    if (!previous) return;
    const distance = Math.hypot(x - previous.x, y - previous.y);
    if (distance < 0.75) return;
    const segments = Math.max(1, Math.ceil(distance / 5));
    for (let index = 1; index <= segments; index += 1) {
      const t = index / segments;
      this.inject(this.movement.current, previous.x + (x - previous.x) * t, previous.y + (y - previous.y) * t, 0.8, 2);
    }
  }

  leave() {
    this.lastMove = null;
  }

  pulse(x: number, y: number, kind: PulseKind = "click") {
    if (y < 0 || y > this.height) return;
    const first = kind === "click" ? 3.5 : 2.5;
    const second = kind === "click" ? 0.58 : 0.4;
    const delay = kind === "click" ? 430 : 400;
    this.inject(this.impulse.current, x, y, first, 4);
    const timer = window.setTimeout(() => {
      this.secondPulses.delete(timer);
      this.inject(this.impulse.current, x, y, second, 2);
    }, delay);
    this.secondPulses.add(timer);
  }

  private inject(target: Float32Array, x: number, y: number, strength: number, radius: number) {
    const centerX = Math.floor(x / this.down);
    const centerY = Math.floor(y / this.down);
    const r = Math.max(1, Math.floor(radius));
    const sigma = r * 0.6;
    const divisor = 2 * sigma * sigma;
    for (let dy = -r; dy <= r; dy += 1) {
      for (let dx = -r; dx <= r; dx += 1) {
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared > r * r) continue;
        const cellX = centerX + dx;
        const cellY = centerY + dy;
        if (cellX < 0 || cellX >= this.fieldWidth || cellY < 0 || cellY >= this.fieldHeight) continue;
        target[cellY * this.fieldWidth + cellX] -= strength * Math.exp(-distanceSquared / divisor);
      }
    }
  }

  private stepLayer(layer: Layer) {
    const { current, previous, damping } = layer;
    for (let y = 1; y < this.fieldHeight - 1; y += 1) {
      const row = y * this.fieldWidth;
      for (let x = 1; x < this.fieldWidth - 1; x += 1) {
        const index = row + x;
        previous[index] = ((current[index - 1] + current[index + 1] + current[index - this.fieldWidth] + current[index + this.fieldWidth]) * 0.5 - previous[index]) * damping;
      }
    }
    const bottom = (this.fieldHeight - 1) * this.fieldWidth;
    for (let x = 0; x < this.fieldWidth; x += 1) {
      previous[x] = 0;
      previous[bottom + x] = 0;
    }
    for (let y = 0; y < this.fieldHeight; y += 1) {
      previous[y * this.fieldWidth] = 0;
      previous[y * this.fieldWidth + this.fieldWidth - 1] = 0;
    }
    layer.current = previous;
    layer.previous = current;
  }

  render(now: number, mobile: boolean) {
    const stepEvery = mobile ? 24 : 14;
    if (!this.lastStep) this.lastStep = now;
    let steps = 0;
    while (now - this.lastStep >= stepEvery && steps < 3) {
      this.stepLayer(this.impulse);
      this.stepLayer(this.movement);
      this.lastStep += stepEvery;
      steps += 1;
    }

    const range = 4;
    for (let index = 0; index < this.encoded.length; index += 1) {
      const value = this.impulse.current[index] + this.movement.current[index];
      this.encoded[index] = Math.round(Math.max(0, Math.min(1, value / range * 0.5 + 0.5)) * 255);
    }

    const gl = this.gl;
    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.fieldTexture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, this.fieldWidth, this.fieldHeight, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, this.encoded);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.uniform2f("uResolution", this.width, this.height);
    this.uniform2f("uImageSize", this.imageWidth, this.imageHeight);
    this.uniform2f("uFieldSize", this.fieldWidth, this.fieldHeight);
    this.uniform1f("uFieldDown", this.down);
    this.uniform1f("uFieldRange", range);
    this.uniform1f("uRefraction", 38);
    this.uniform1f("uMaxOffset", 18);
    this.uniform1f("uMinGradient", 0.006);
    this.uniform1f("uCellSize", mobile ? 28 : 32);
    this.uniform1f("uGridAlpha", mobile ? 0.3 : 0.36);
    this.uniform1f("uHasImage", this.imageReady ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  private uniform1f(name: string, value: number) {
    const location = this.gl.getUniformLocation(this.program, name);
    if (location !== null) this.gl.uniform1f(location, value);
  }

  private uniform1i(name: string, value: number) {
    const location = this.gl.getUniformLocation(this.program, name);
    if (location !== null) this.gl.uniform1i(location, value);
  }

  private uniform2f(name: string, x: number, y: number) {
    const location = this.gl.getUniformLocation(this.program, name);
    if (location !== null) this.gl.uniform2f(location, x, y);
  }

  destroy() {
    this.destroyed = true;
    this.canvas.removeAttribute("data-ready");
    this.secondPulses.forEach((timer) => window.clearTimeout(timer));
    this.secondPulses.clear();
    this.gl.deleteTexture(this.fieldTexture);
    this.gl.deleteTexture(this.wallpaperTexture);
    this.gl.deleteProgram(this.program);
  }
}
