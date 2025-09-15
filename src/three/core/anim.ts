export type Easer = (t: number) => number;

export const easeInOutCubic: Easer = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export interface Tween {
  update(dt: number): boolean; // returns true if still running
}

export class TweenScheduler {
  private tweens: Set<Tween> = new Set();
  add(t: Tween) {
    this.tweens.add(t);
  }
  update(dt: number) {
    for (const t of Array.from(this.tweens)) {
      const alive = t.update(dt);
      if (!alive) this.tweens.delete(t);
    }
  }
  clear() {
    this.tweens.clear();
  }
}

export class TimedTween implements Tween {
  private elapsed = 0;
  private duration: number;
  private onUpdate: (tNorm: number) => void;
  private onComplete?: () => void;
  private ease: Easer;
  constructor(
    duration: number,
    onUpdate: (tNorm: number) => void,
    onComplete?: () => void,
    ease: Easer = easeInOutCubic
  ) {
    this.duration = duration;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.ease = ease;
  }
  update(dt: number): boolean {
    this.elapsed += dt;
    const t = Math.min(1, this.elapsed / this.duration);
    this.onUpdate(this.ease(t));
    if (t >= 1) {
      this.onComplete?.();
      return false;
    }
    return true;
  }
}
