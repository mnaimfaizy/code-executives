import React, { useRef, useEffect, useCallback } from 'react';

/** Number of stars per layer */
const STAR_COUNTS = [180, 120, 60] as const;
/** Speed multipliers for parallax layers (slower → faster) */
const LAYER_SPEEDS = [0.08, 0.15, 0.25] as const;
/** Star size ranges per layer [min, max] */
const STAR_SIZES: readonly [number, number][] = [
  [0.5, 1.2],
  [1.0, 2.0],
  [1.5, 3.0],
];
/** Star opacity ranges per layer [min, max] */
const STAR_OPACITIES: readonly [number, number][] = [
  [0.4, 0.7],
  [0.6, 0.9],
  [0.8, 1.0],
];

/** Target frame interval (~30fps) */
const FRAME_INTERVAL_MS = 1000 / 30;

/** Shooting star interval (ms) */
const SHOOTING_STAR_INTERVAL = 15_000;
const SHOOTING_STAR_DURATION = 800;

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  startTime: number;
}

function createStars(width: number, height: number): Star[][] {
  return STAR_COUNTS.map((count, layerIndex) => {
    const [minSize, maxSize] = STAR_SIZES[layerIndex];
    const [minOpacity, maxOpacity] = STAR_OPACITIES[layerIndex];
    const speed = LAYER_SPEEDS[layerIndex];

    return Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: minSize + Math.random() * (maxSize - minSize),
      opacity: minOpacity + Math.random() * (maxOpacity - minOpacity),
      speed,
      twinkleSpeed: 0.5 + Math.random() * 2,
      twinklePhase: Math.random() * Math.PI * 2,
    }));
  });
}

function spawnShootingStar(width: number, height: number, time: number): ShootingStar {
  const startX = Math.random() * width * 0.8;
  const startY = Math.random() * height * 0.3;
  const angle = Math.PI / 6 + Math.random() * (Math.PI / 6); // 30°–60°
  const speed = 4 + Math.random() * 3;
  return {
    x: startX,
    y: startY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    length: 40 + Math.random() * 60,
    startTime: time,
  };
}

const SpaceBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[][]>([]);
  const animationRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);
  const shootingStarRef = useRef<ShootingStar | null>(null);
  const lastShootingRef = useRef<number>(0);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
    const { width, height } = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const logicalW = width / dpr;
    const logicalH = height / dpr;

    ctx.clearRect(0, 0, width, height);

    // Draw stars
    for (const layer of starsRef.current) {
      for (const star of layer) {
        const twinkle = prefersReducedMotion.current
          ? 1
          : 0.7 + 0.3 * Math.sin(time * 0.001 * star.twinkleSpeed + star.twinklePhase);

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 224, 255, ${star.opacity * twinkle})`;
        ctx.fill();

        if (!prefersReducedMotion.current) {
          star.y -= star.speed;
          if (star.y < -star.radius) {
            star.y = logicalH + star.radius;
            star.x = Math.random() * logicalW;
          }
        }
      }
    }

    // Shooting star logic (skip if reduced motion)
    if (!prefersReducedMotion.current) {
      // Spawn a new shooting star periodically
      if (time - lastShootingRef.current > SHOOTING_STAR_INTERVAL) {
        shootingStarRef.current = spawnShootingStar(logicalW, logicalH, time);
        lastShootingRef.current = time;
      }

      const ss = shootingStarRef.current;
      if (ss) {
        const elapsed = time - ss.startTime;
        if (elapsed > SHOOTING_STAR_DURATION) {
          shootingStarRef.current = null;
        } else {
          const progress = elapsed / SHOOTING_STAR_DURATION;
          const fadeOut = 1 - progress;
          const cx = ss.x + ss.vx * elapsed * 0.1;
          const cy = ss.y + ss.vy * elapsed * 0.1;
          const tailX = cx - ss.vx * ss.length * 0.02;
          const tailY = cy - ss.vy * ss.length * 0.02;

          const gradient = ctx.createLinearGradient(tailX, tailY, cx, cy);
          gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
          gradient.addColorStop(1, `rgba(255, 255, 255, ${0.8 * fadeOut})`);

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(cx, cy);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Bright head
          ctx.beginPath();
          ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${fadeOut})`;
          ctx.fill();
        }
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = (): void => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      starsRef.current = createStars(window.innerWidth, window.innerHeight);
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = (time: number): void => {
      // Pause when tab is hidden
      if (document.hidden) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Cap at ~30fps
      if (time - lastFrameRef.current < FRAME_INTERVAL_MS) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameRef.current = time;

      draw(ctx, time);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, willChange: 'transform' }}
      aria-hidden="true"
    />
  );
};

export default SpaceBackground;
