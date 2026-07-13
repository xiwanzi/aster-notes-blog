"use client";

import { useEffect, useRef } from "react";
import { WaterRefraction } from "@/lib/waterRefraction";

export const wallpapers = [
  { file: "wallpaper-rain-corridor.webp", name: "雨夜回廊", tone: "dark" as const },
];

type ThemeTone = "light" | "dark";
type Star = { x: number; y: number; vx: number; vy: number; radius: number; phase: number; alpha: number };
type Ripple = { x: number; y: number; born: number; duration: number; maxRadius: number; strength: number };
type Drop = { x: number; y: number; speed: number; length: number; impact: number };

function createStars(width: number, height: number, mobile: boolean): Star[] {
  const count = Math.min(mobile ? 32 : 86, Math.max(24, Math.floor((width * height) / (mobile ? 19000 : 12500))));
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.025,
    vy: (Math.random() - 0.5) * 0.018,
    radius: Math.random() > 0.83 ? 1.7 + Math.random() * 1.1 : 0.55 + Math.random() * 0.85,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.24 + Math.random() * 0.58,
  }));
}

export function AmbientBackdrop({ wallpaperIndex, tone }: { wallpaperIndex: number; tone: ThemeTone }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const refractionCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const refractionCanvas = refractionCanvasRef.current;
    if (!canvas || !refractionCanvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    let water: WaterRefraction | null = null;
    try {
      water = new WaterRefraction(refractionCanvas, `${basePath}/${wallpapers[wallpaperIndex].file}`);
    } catch (error) {
      console.warn("Water refraction fallback:", error);
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars: Star[] = [];
    let ripples: Ripple[] = [];
    let drops: Drop[] = [];
    let pointer = { x: -1000, y: -1000, active: false };
    let animationFrame = 0;
    let previous = performance.now();
    let lastRain = previous;
    let paused = document.hidden;

    const colors = tone === "dark"
      ? { star: "235, 244, 246", link: "203, 220, 224", glow: "91, 222, 207", rain: "225, 234, 238" }
      : { star: "255, 255, 255", link: "238, 122, 177", glow: "255, 135, 190", rain: "255, 255, 255" };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, coarsePointer.matches ? 1.25 : 1.75);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = createStars(width, height, coarsePointer.matches || width <= 900);
      drops = [];
      const wallpaperHeight = Math.max(width / 1.59879, height);
      water?.resize(width, wallpaperHeight, window.devicePixelRatio || 1, coarsePointer.matches || width <= 900);
    };

    const addRipple = (x: number, y: number, kind: "click" | "drop" = "click") => {
      const click = kind === "click";
      ripples.push({
        x,
        y,
        born: performance.now(),
        duration: click ? 560 : 430,
        maxRadius: Math.min(width, height) * (click ? 0.028 : 0.017) * (0.8 + Math.random() * 0.4),
        strength: click ? 1 : 0.72,
      });
      if (ripples.length > 14) ripples.shift();
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY, active: true };
      water?.move(event.clientX, event.clientY + window.scrollY);
    };
    const onPointerLeave = () => {
      pointer.active = false;
      water?.leave();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, option")) return;
      addRipple(event.clientX, event.clientY, "click");
      water?.pulse(event.clientX, event.clientY + window.scrollY, "click");
    };
    const onVisibility = () => {
      paused = document.hidden;
      previous = performance.now();
      if (!paused && !animationFrame) {
        if (reducedMotion.matches) draw(performance.now());
        else animationFrame = requestAnimationFrame(draw);
      }
    };

    const draw = (now: number) => {
      animationFrame = 0;
      if (paused) return;
      const delta = Math.min(48, now - previous);
      previous = now;
      water?.render(now, coarsePointer.matches || width <= 900);
      context.clearRect(0, 0, width, height);

      if (pointer.active) {
        const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 280);
        glow.addColorStop(0, `rgba(${colors.glow},.09)`);
        glow.addColorStop(0.42, `rgba(${colors.glow},.035)`);
        glow.addColorStop(1, `rgba(${colors.glow},0)`);
        context.fillStyle = glow;
        context.fillRect(pointer.x - 280, pointer.y - 280, 560, 560);
      }

      for (const star of stars) {
        star.x += star.vx * delta;
        star.y += star.vy * delta;
        if (star.x < -4) star.x = width + 4;
        if (star.x > width + 4) star.x = -4;
        if (star.y < -4) star.y = height + 4;
        if (star.y > height + 4) star.y = -4;
      }

      context.lineWidth = 0.7;
      for (let first = 0; first < stars.length; first += 1) {
        const a = stars[first];
        let nearest = -1;
        let nearestDistance = 145;
        for (let second = first + 1; second < stars.length; second += 1) {
          const b = stars[second];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance < nearestDistance) { nearestDistance = distance; nearest = second; }
        }
        if (nearest >= 0) {
          const b = stars[nearest];
          const pointerLift = pointer.active && Math.hypot(a.x - pointer.x, a.y - pointer.y) < 145 ? 0.1 : 0;
          context.strokeStyle = `rgba(${colors.link},${0.025 + pointerLift})`;
          context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
        }
      }

      for (const star of stars) {
        const twinkle = 0.72 + Math.sin(now * 0.0017 + star.phase) * 0.28;
        const pointerLift = pointer.active ? Math.max(0, 1 - Math.hypot(star.x - pointer.x, star.y - pointer.y) / 150) : 0;
        context.fillStyle = `rgba(${colors.star},${Math.min(1, star.alpha * twinkle + pointerLift * 0.65)})`;
        context.beginPath(); context.arc(star.x, star.y, star.radius + pointerLift * 0.8, 0, Math.PI * 2); context.fill();
      }

      if (!coarsePointer.matches && !reducedMotion.matches && now - lastRain > 3600 + Math.random() * 1400) {
        drops.push({ x: Math.random() * width, y: -24, speed: 0.74 + Math.random() * 0.26, length: 12 + Math.random() * 9, impact: height * (0.54 + Math.random() * 0.38) });
        lastRain = now;
      }
      context.strokeStyle = `rgba(${colors.rain},.66)`;
      context.lineWidth = 1.5;
      drops = drops.filter((drop) => {
        drop.y += drop.speed * delta;
        context.beginPath(); context.moveTo(drop.x, drop.y - drop.length); context.lineTo(drop.x - 1, drop.y); context.stroke();
        if (drop.y >= drop.impact) {
          addRipple(drop.x, drop.impact, "drop");
          water?.pulse(drop.x, drop.impact + window.scrollY, "drop");
          return false;
        }
        return true;
      });

      ripples = ripples.filter((ripple) => {
        const age = now - ripple.born;
        if (age > ripple.duration) return false;
        const progress = age / ripple.duration;
        const eased = 1 - Math.pow(1 - progress, 2);
        const radius = Math.max(1, ripple.maxRadius * (0.3 + eased * 0.7));
        const alpha = (1 - progress) * 0.36 * Math.sqrt(ripple.strength);
        const glow = context.createRadialGradient(ripple.x, ripple.y, 0, ripple.x, ripple.y, radius);
        glow.addColorStop(0, `rgba(${colors.star},${alpha})`);
        glow.addColorStop(0.42, `rgba(${colors.glow},${alpha * 0.28})`);
        glow.addColorStop(1, `rgba(${colors.glow},0)`);
        context.save();
        context.globalCompositeOperation = tone === "dark" ? "screen" : "source-over";
        context.fillStyle = glow;
        context.fillRect(ripple.x - radius, ripple.y - radius, radius * 2, radius * 2);
        context.restore();
        return true;
      });

      if (!reducedMotion.matches) animationFrame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    if (!reducedMotion.matches) animationFrame = requestAnimationFrame(draw);
    else draw(performance.now());

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("visibilitychange", onVisibility);
      water?.destroy();
    };
  }, [tone, wallpaperIndex]);

  return <>
    <div className="wallpaper-overlay" aria-hidden="true">
      <div className="wallpaper-frames">
        {wallpapers.map((wallpaper, index) => <div
          className={`wallpaper-frame ${index === wallpaperIndex ? "is-active" : ""}`}
          key={wallpaper.file}
          style={{ backgroundImage: `url("${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/${wallpaper.file}")` }}
        />)}
        <canvas ref={refractionCanvasRef} className="starlake-refraction-canvas" />
        <div className="wallpaper-dim" />
        <div className="wallpaper-vignette" />
      </div>
      <div className="wallpaper-seam">
        <svg className="wave wave-one" viewBox="0 0 3600 180" preserveAspectRatio="none"><path d="M0 82C180 38 310 132 520 88s350-13 520 20 358 45 560-14 358-45 560 1 360 42 540-8 355-38 540 5V180H0Z"/><path transform="translate(1800)" d="M0 82C180 38 310 132 520 88s350-13 520 20 358 45 560-14 358-45 560 1 360 42 540-8 355-38 540 5V180H0Z"/></svg>
        <svg className="wave wave-two" viewBox="0 0 3600 180" preserveAspectRatio="none"><path d="M0 100c220-55 360 32 550 12s322-72 538-18 348 68 552 15 338-60 530-17 350 47 530 0 352-34 500 8v80H0Z"/><path transform="translate(1800)" d="M0 100c220-55 360 32 550 12s322-72 538-18 348 68 552 15 338-60 530-17 350 47 530 0 352-34 500 8v80H0Z"/></svg>
        <svg className="wave wave-three" viewBox="0 0 3600 180" preserveAspectRatio="none"><path d="M0 118c180-36 337 28 535 2s344-57 542-5 353 35 552-2 349-42 540 0 342 38 531 5 354-28 500 5v57H0Z"/><path transform="translate(1800)" d="M0 118c180-36 337 28 535 2s344-57 542-5 353 35 552-2 349-42 540 0 342 38 531 5 354-28 500 5v57H0Z"/></svg>
        <svg className="wave wave-four" viewBox="0 0 3600 180" preserveAspectRatio="none"><path d="M0 136c210-25 348 17 546 3s347-38 545-2 353 25 548 0 351-27 542 1 344 21 529 2 348-18 490 3v37H0Z"/><path transform="translate(1800)" d="M0 136c210-25 348 17 546 3s347-38 545-2 353 25 548 0 351-27 542 1 344 21 529 2 348-18 490 3v37H0Z"/></svg>
      </div>
    </div>
    <canvas ref={canvasRef} className="starlake-canvas" aria-hidden="true" />
  </>;
}
