import { useCallback, useState } from 'react';
import { canUseWebGL } from '../utils/webgl';

export type VizView = '2d' | '3d';

export interface ViewChoice {
  /** The view to draw: 3D only when it was chosen and WebGL is available; otherwise 2D. */
  view: VizView;
  /** False when the browser has no WebGL: the 3D option is disabled. */
  webgl: boolean;
  /** Picks a view and remembers it under the storage key. */
  chooseView: (view: VizView) => void;
}

const readStoredView = (key: string): VizView | null => {
  try {
    const v = window.localStorage.getItem(key);
    return v === '2d' || v === '3d' ? v : null;
  } catch {
    return null;
  }
};

/**
 * The learner's choice between the 2D and 3D views, remembered in `localStorage` under
 * `storageKey`. 2D is the default, and the only view without WebGL.
 */
export function useViewChoice(storageKey: string): ViewChoice {
  const [webgl] = useState(canUseWebGL);
  const [chosen, setChosen] = useState<VizView | null>(() => readStoredView(storageKey));

  const chooseView = useCallback(
    (view: VizView) => {
      setChosen(view);
      try {
        window.localStorage.setItem(storageKey, view);
      } catch {
        // Storage unavailable (private mode): the choice just isn't remembered.
      }
    },
    [storageKey]
  );

  return { view: webgl && chosen === '3d' ? '3d' : '2d', webgl, chooseView };
}

export default useViewChoice;
