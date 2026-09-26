import { useCallback, useEffect, useState, type RefObject } from 'react';

export interface Fullscreen {
  /** False when the browser has no Fullscreen API: hide the control. */
  supported: boolean;
  isFullscreen: boolean;
  toggle: () => void;
}

const isSupported = () =>
  typeof document !== 'undefined' &&
  Boolean(document.fullscreenEnabled) &&
  typeof document.documentElement?.requestFullscreen === 'function';

/**
 * Full screen for one element over the Fullscreen API. Tracks `fullscreenchange`, so Esc and
 * browser chrome stay in sync. Without the API it is a no-op with `supported: false`.
 */
export function useFullscreen(ref: RefObject<HTMLElement | null>): Fullscreen {
  const [supported] = useState(isSupported);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!supported) return;
    const sync = () =>
      setIsFullscreen(ref.current !== null && document.fullscreenElement === ref.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, [supported, ref]);

  const toggle = useCallback(() => {
    if (!supported) return;
    const el = ref.current;
    if (!el) return;
    const request =
      document.fullscreenElement === el ? document.exitFullscreen() : el.requestFullscreen();
    // A refused request (no user gesture, iframe policy) simply leaves the view as it is.
    void request?.catch(() => undefined);
  }, [supported, ref]);

  return { supported, isFullscreen, toggle };
}

export default useFullscreen;
