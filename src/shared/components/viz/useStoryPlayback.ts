import { useCallback, useEffect, useState } from 'react';

export type StorySpeed = 'slow' | 'normal' | 'fast';

/** How long a beat stays up while the story plays by itself. */
export const STORY_SPEED_MS: Record<StorySpeed, number> = { slow: 6000, normal: 4000, fast: 2500 };

export interface StoryPlayback {
  /** Index of the beat on screen. */
  index: number;
  /** Index of the last beat. */
  last: number;
  playing: boolean;
  speed: StorySpeed;
  setSpeed: (speed: StorySpeed) => void;
  /** Steps by `delta` beats, staying inside the story. */
  go: (delta: number) => void;
  /** Jumps to a beat (the beat strip). */
  select: (index: number) => void;
  /** Back to the first beat, paused. */
  restart: () => void;
  /** Play or pause; Play on the last beat starts over. */
  togglePlay: () => void;
}

/** The beat a story section is on and its autoplay: the state behind `StoryControls`. */
export function useStoryPlayback(count: number): StoryPlayback {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<StorySpeed>('normal');
  const last = count - 1;

  const go = useCallback(
    (delta: number) => setIndex((i) => Math.min(last, Math.max(0, i + delta))),
    [last]
  );

  useEffect(() => {
    if (!playing) return;
    if (index >= last) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => go(1), STORY_SPEED_MS[speed]);
    return () => window.clearTimeout(t);
  }, [playing, index, last, speed, go]);

  const restart = useCallback(() => {
    setPlaying(false);
    setIndex(0);
  }, []);

  const togglePlay = () => {
    if (!playing && index === last) setIndex(0);
    setPlaying((p) => !p);
  };

  return { index, last, playing, speed, setSpeed, go, select: setIndex, restart, togglePlay };
}

export default useStoryPlayback;
