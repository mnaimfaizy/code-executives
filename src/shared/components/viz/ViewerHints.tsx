import React from 'react';

/** The standing hint under the 3D canvas. */
export const Viewer3DHint: React.FC = () => (
  <div className="pointer-events-none absolute bottom-2 left-3 text-[11px] text-slate-400">
    Drag to orbit · right-drag to pan · Ctrl + scroll to zoom
  </div>
);

/** Shown briefly when a plain wheel scrolls the page over the 3D viewer. */
export const WheelZoomHint: React.FC<{ visible: boolean }> = ({ visible }) => (
  <div
    aria-hidden
    className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-300 ${
      visible ? 'opacity-100' : 'opacity-0'
    }`}
  >
    <div className="rounded-full bg-slate-900/80 px-4 py-2 text-sm font-medium text-white shadow-lg">
      Use Ctrl + scroll to zoom
    </div>
  </div>
);
