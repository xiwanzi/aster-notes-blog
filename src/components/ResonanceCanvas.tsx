"use client";

import { useEffect, useRef } from "react";

export type CinematicPhase = "idle" | "charging" | "flight" | "converge" | "burst" | "results";

type Particle = {
  x: number;
  y: number;
  z: number;
  angle: number;
  radius: number;
  speed: number;
  seed: number;
  size: number;
};

type ResonanceCanvasProps = {
  phase: CinematicPhase;
  rarity?: 3 | 4 | 5;
  className?: string;
};

const TAU = Math.PI * 2;

function seeded(index: number, salt = 0) {
  const value = Math.sin(index * 91.173 + salt * 47.719) * 43758.5453;
  return value - Math.floor(value);
}

function accentFor(rarity: 3 | 4 | 5) {
  if (rarity === 5) return { main: "246, 216, 154", edge: "255, 249, 218" };
  if (rarity === 4) return { main: "183, 156, 255", edge: "224, 211, 255" };
  return { main: "118, 239, 244", edge: "220, 254, 255" };
}

export function ResonanceCanvas({ phase, rarity = 3, className = "" }: ResonanceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };
    const accent = accentFor(rarity);
    const particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let lastTime = performance.now();
    const startedAt = lastTime;

    const populate = () => {
      particles.length = 0;
      const mobile = width < 760;
      const baseCount = phase === "idle" ? 72 : phase === "flight" ? 230 : 138;
      const count = reducedMotion ? Math.round(baseCount * 0.32) : Math.round(baseCount * (mobile ? 0.68 : 1));
      const maxRadius = Math.hypot(width, height) * 0.58;
      for (let index = 0; index < count; index += 1) {
        particles.push({
          x: phase === "flight" ? (seeded(index, 1) - 0.5) * 1.45 : seeded(index, 1) * width,
          y: phase === "flight" ? (seeded(index, 2) - 0.5) : seeded(index, 2) * height,
          z: 0.08 + seeded(index, 3) * 0.92,
          angle: seeded(index, 4) * TAU,
          radius: 26 + seeded(index, 5) * maxRadius,
          speed: 0.35 + seeded(index, 6) * 1.45,
          seed: seeded(index, 7),
          size: 0.55 + seeded(index, 8) * 1.8,
        });
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      populate();
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.targetX = event.clientX / Math.max(1, window.innerWidth) * 2 - 1;
      pointer.targetY = event.clientY / Math.max(1, window.innerHeight) * 2 - 1;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
      pointer.active = false;
    };

    const line = (x1: number, y1: number, x2: number, y2: number, alpha: number, lineWidth = 1) => {
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.strokeStyle = `rgba(${accent.main}, ${Math.max(0, alpha)})`;
      context.lineWidth = lineWidth;
      context.stroke();
    };

    const drawIdle = (elapsed: number, delta: number) => {
      const focusX = width * (0.5 + pointer.x * 0.18);
      const focusY = height * (0.5 + pointer.y * 0.16);
      particles.forEach((particle, index) => {
        particle.x += Math.cos(particle.angle) * particle.speed * delta * 8;
        particle.y += Math.sin(particle.angle * 0.71) * particle.speed * delta * 5;
        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = height + 20;
        if (particle.y > height + 20) particle.y = -20;

        const dx = focusX - particle.x;
        const dy = focusY - particle.y;
        const distance = Math.hypot(dx, dy);
        const influence = pointer.active ? Math.max(0, 1 - distance / 220) : 0;
        if (influence > 0) {
          particle.x += dx * influence * delta * 0.18;
          particle.y += dy * influence * delta * 0.18;
          line(particle.x, particle.y, focusX, focusY, influence * 0.11, 0.6);
        }
        const pulse = 0.34 + Math.sin(elapsed * 1.4 + index) * 0.18;
        context.fillStyle = `rgba(185, 246, 255, ${pulse})`;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, TAU);
        context.fill();
      });

      if (pointer.active) {
        const glow = context.createRadialGradient(focusX, focusY, 0, focusX, focusY, 88);
        glow.addColorStop(0, "rgba(184, 252, 255, .12)");
        glow.addColorStop(0.42, "rgba(84, 223, 232, .055)");
        glow.addColorStop(1, "rgba(84, 223, 232, 0)");
        context.fillStyle = glow;
        context.fillRect(focusX - 88, focusY - 88, 176, 176);
      }
    };

    const drawCharging = (elapsed: number, delta: number) => {
      const centerX = width / 2 + pointer.x * 22;
      const centerY = height / 2 + pointer.y * 15;
      const maxRadius = Math.hypot(width, height) * 0.58;
      particles.forEach((particle, index) => {
        const previousRadius = particle.radius;
        particle.radius -= delta * (58 + particle.speed * 52) * (1 + Math.min(1.3, elapsed * 0.42));
        particle.angle += delta * (0.22 + particle.seed * 0.34);
        if (particle.radius < 12) particle.radius = maxRadius * (0.76 + particle.seed * 0.3);
        const squash = 0.68 + particle.seed * 0.2;
        const x = centerX + Math.cos(particle.angle) * particle.radius;
        const y = centerY + Math.sin(particle.angle) * particle.radius * squash;
        const oldX = centerX + Math.cos(particle.angle - delta * 0.3) * previousRadius;
        const oldY = centerY + Math.sin(particle.angle - delta * 0.3) * previousRadius * squash;
        const intensity = 1 - Math.min(1, particle.radius / maxRadius);
        line(oldX, oldY, x, y, 0.09 + intensity * 0.45, 0.6 + intensity * 1.4);
        if (index % 6 === 0) {
          context.fillStyle = `rgba(${accent.edge}, ${0.22 + intensity * 0.55})`;
          context.beginPath();
          context.arc(x, y, particle.size + intensity * 1.6, 0, TAU);
          context.fill();
        }
      });

      for (let ring = 0; ring < 3; ring += 1) {
        const radius = 70 + ring * 48 + Math.sin(elapsed * 2.2 + ring) * 8;
        context.beginPath();
        context.ellipse(centerX, centerY, radius * 1.5, radius * 0.55, elapsed * (ring % 2 ? -0.13 : 0.1), 0, TAU);
        context.strokeStyle = `rgba(${accent.main}, ${0.09 + ring * 0.025})`;
        context.lineWidth = 1;
        context.stroke();
      }
    };

    const resetFlightParticle = (particle: Particle, index: number) => {
      particle.x = (seeded(index + Math.round(performance.now()), 11) - 0.5) * 1.45;
      particle.y = seeded(index + Math.round(performance.now()), 12) - 0.5;
      particle.z = 1;
    };

    const drawFlight = (elapsed: number, delta: number) => {
      const centerX = width / 2 + pointer.x * width * 0.045;
      const centerY = height / 2 + pointer.y * height * 0.04;
      const speed = 0.46 + Math.min(1.2, elapsed * 0.7);
      particles.forEach((particle, index) => {
        particle.z -= delta * speed * (0.72 + particle.speed * 0.38);
        if (particle.z <= 0.025) resetFlightParticle(particle, index);
        const scale = 1 / Math.max(0.035, particle.z);
        const tailZ = Math.min(1, particle.z + 0.075 + particle.speed * 0.025);
        const previousScale = 1 / Math.max(0.035, tailZ);
        const x = centerX + particle.x * width * 0.48 * scale;
        const y = centerY + particle.y * height * 0.54 * scale;
        const oldX = centerX + particle.x * width * 0.48 * previousScale;
        const oldY = centerY + particle.y * height * 0.54 * previousScale;
        const alpha = Math.min(0.92, (1 - particle.z) * 0.9 + 0.06);
        line(oldX, oldY, x, y, alpha, Math.min(3.4, particle.size * scale * 0.15));
      });

      const tunnel = context.createRadialGradient(centerX, centerY, 2, centerX, centerY, Math.min(width, height) * 0.42);
      tunnel.addColorStop(0, `rgba(${accent.edge}, .18)`);
      tunnel.addColorStop(0.12, `rgba(${accent.main}, .06)`);
      tunnel.addColorStop(1, `rgba(${accent.main}, 0)`);
      context.fillStyle = tunnel;
      context.fillRect(0, 0, width, height);
    };

    const drawConverge = (elapsed: number) => {
      const centerX = width / 2 + pointer.x * 10;
      const centerY = height / 2 + pointer.y * 8;
      const maxRadius = Math.hypot(width, height) * 0.5;
      particles.forEach((particle, index) => {
        const progress = Math.min(1, elapsed / 1.25);
        const radius = Math.max(13, particle.radius * (1 - progress * 0.94));
        const angle = particle.angle + elapsed * (1.2 + particle.speed) * (index % 2 ? 1 : -1);
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius * 0.66;
        const tailRadius = Math.min(maxRadius, radius + 22 + particle.speed * 18);
        const oldX = centerX + Math.cos(angle - 0.1) * tailRadius;
        const oldY = centerY + Math.sin(angle - 0.1) * tailRadius * 0.66;
        line(oldX, oldY, x, y, 0.15 + progress * 0.5, 0.7 + progress * 1.5);
      });

      const pulse = 28 + Math.sin(elapsed * 8) * 6;
      const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150 + pulse);
      glow.addColorStop(0, `rgba(${accent.edge}, .94)`);
      glow.addColorStop(0.08, `rgba(${accent.main}, .48)`);
      glow.addColorStop(0.4, `rgba(${accent.main}, .12)`);
      glow.addColorStop(1, `rgba(${accent.main}, 0)`);
      context.fillStyle = glow;
      context.fillRect(centerX - 190, centerY - 190, 380, 380);
    };

    const drawBurst = (elapsed: number) => {
      const centerX = width / 2;
      const centerY = height / 2;
      particles.forEach((particle, index) => {
        const localElapsed = Math.max(0, elapsed - particle.seed * 0.18);
        const distance = Math.pow(localElapsed * (260 + particle.speed * 310), 0.9);
        const angle = particle.angle + Math.sin(index) * 0.08;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance * (0.62 + particle.seed * 0.4);
        const trail = 18 + particle.speed * 38;
        const alpha = Math.max(0, 1 - localElapsed / 1.48);
        line(x - Math.cos(angle) * trail, y - Math.sin(angle) * trail, x, y, alpha * 0.8, 0.8 + particle.size);
      });

      [0, 0.18, 0.42].forEach((delay, index) => {
        const local = elapsed - delay;
        if (local <= 0 || local > 1.2) return;
        const radius = local * (260 + index * 70);
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, TAU);
        context.strokeStyle = `rgba(${accent.edge}, ${Math.max(0, 0.42 - local * 0.34)})`;
        context.lineWidth = Math.max(0.5, 3 - local * 2);
        context.stroke();
      });
    };

    const draw = (time: number) => {
      const delta = Math.min(0.033, (time - lastTime) / 1000);
      const elapsed = (time - startedAt) / 1000;
      lastTime = time;
      pointer.x += (pointer.targetX - pointer.x) * Math.min(1, delta * 7.5);
      pointer.y += (pointer.targetY - pointer.y) * Math.min(1, delta * 7.5);
      context.clearRect(0, 0, width, height);
      context.save();
      context.globalCompositeOperation = "lighter";
      if (phase === "idle" || phase === "results") drawIdle(elapsed, delta);
      else if (phase === "charging") drawCharging(elapsed, delta);
      else if (phase === "flight") drawFlight(elapsed, delta);
      else if (phase === "converge") drawConverge(elapsed);
      else drawBurst(elapsed);
      context.restore();
      frame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    frame = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [phase, rarity]);

  return <canvas ref={canvasRef} className={`resonance-canvas ${className}`.trim()} aria-hidden="true" />;
}
