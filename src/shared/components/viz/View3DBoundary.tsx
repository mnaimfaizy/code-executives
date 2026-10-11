import React, { Suspense } from 'react';
import { ErrorBoundary } from '../feedback';
import type { VizTheme } from '../../viz/palette';

export interface View3DBoundaryProps {
  /** The 2D view of the same beat or step: shown while 3D loads and when it fails. */
  view2D: React.ReactNode;
  /** Stories are light; the Playground is dark. Default `light`. */
  theme?: VizTheme;
  /** The lazy 3D renderer. */
  children: React.ReactNode;
}

const FAILED: Record<VizTheme, string> = {
  light: 'absolute left-3 top-3 rounded bg-rose-50 px-2 py-1 text-xs text-rose-700',
  dark: 'absolute left-3 top-3 rounded bg-[#4c0519] px-2 py-1 text-xs text-[#fecdd3]',
};
const LOADING: Record<VizTheme, string> = {
  light:
    'absolute inset-0 flex items-center justify-center bg-white/60 text-sm font-medium text-slate-600 backdrop-blur-[1px]',
  dark: 'absolute inset-0 flex items-center justify-center bg-[#0a0a1a]/60 text-sm font-medium text-[#e0e0ff] backdrop-blur-[1px]',
};

/**
 * Wraps a lazy 3D renderer: the 2D view stands in while the chunk loads, and takes over when
 * 3D fails to start or throws while rendering.
 */
const View3DBoundary: React.FC<View3DBoundaryProps> = ({ view2D, theme = 'light', children }) => (
  <ErrorBoundary
    fallback={
      <div className="relative h-full">
        {view2D}
        <div className={FAILED[theme]}>3D failed to start — showing 2D.</div>
      </div>
    }
  >
    <Suspense
      fallback={
        <div className="relative h-full">
          {view2D}
          <div className={LOADING[theme]}>Loading 3D…</div>
        </div>
      }
    >
      {children}
    </Suspense>
  </ErrorBoundary>
);

export default View3DBoundary;
