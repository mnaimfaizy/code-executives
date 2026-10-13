import { useMemo, type RefObject } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * Where a scene's DOM labels are attached: the Canvas's outer element, the one LabelFramer
 * searches. Pass it to every drei `Html` as `portal`.
 *
 * Without it `Html` attaches to the canvas's parent and moves to the event target as soon as
 * the Canvas connects one, inside the commit that mounted the scene. The move unmounts the
 * label's React root while React is rendering: React logs "Attempted to synchronously unmount
 * a root", and the unmount it had to put off then empties the scene's first label for good.
 * A target that is right from the first render is never moved.
 *
 * THREE.JS SIDE: this module imports R3F. Import it ONLY from `src/shared/viz3d/` or a
 * renderer that a story section loads with `React.lazy`.
 */
export function useLabelHost(): RefObject<HTMLElement> | undefined {
  const canvas = useThree((s) => s.gl.domElement);
  return useMemo(() => {
    const host = canvas.parentElement?.parentElement;
    return host ? { current: host } : undefined;
  }, [canvas]);
}
