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

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  twinklePhase: number;
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

const SpaceBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[][]>([]);
  const animationRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
    const { width, height } = ctx.canvas;
    ctx.clearRect(0, 0, width, height);

    for (const layer of starsRef.current) {
      for (const star of layer) {
        // Twinkle effect (skip if reduced motion)
        const twinkle = prefersReducedMotion.current
          ? 1
          : 0.7 + 0.3 * Math.sin(time * 0.001 * star.twinkleSpeed + star.twinklePhase);

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 224, 255, ${star.opacity * twinkle})`;
        ctx.fill();

        // Slowly drift upward (skip if reduced motion)
        if (!prefersReducedMotion.current) {
          star.y -= star.speed;
          if (star.y < -star.radius) {
            star.y = height + star.radius;
            star.x = Math.random() * width;
          }
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
      ctx.scale(dpr, dpr);
      starsRef.current = createStars(window.innerWidth, window.innerHeight);
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = (time: number): void => {
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
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
};

export default SpaceBackground;
