import React from 'react';

export interface TwoDLayoutProps {
  title?: string;
  editor: React.ReactNode; // left-top
  output: React.ReactNode; // left-bottom
  canvas: React.ReactNode; // right side
  height?: number; // layout height in px
}

const TwoDLayout: React.FC<TwoDLayoutProps> = ({ title, editor, output, canvas, height = 560 }) => {
  return (
    <div className="relative w-full max-w-full overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-50 to-slate-200 p-4 shadow-xl sm:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />
      {title && (
        <div className="mb-4">
          <h3 className="bg-gradient-to-tr from-indigo-500 to-violet-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            {title}
          </h3>
          <div className="mt-1 h-0.5 w-16 rounded bg-gradient-to-r from-indigo-500 to-violet-500/80 opacity-70" />
        </div>
      )}
      <div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row">
        {/* Left column */}
        <div className="min-w-0 space-y-3 lg:w-[44%]">
          <div
            className="relative w-full min-w-0 overflow-hidden rounded-xl border border-slate-300/50 bg-gradient-to-br from-white to-slate-50 p-2 shadow hover:-translate-y-0.5 hover:shadow-lg transition-all"
            style={{ height: `min(max(250px, ${height * 0.55}px), ${height * 0.55}px)` }}
          >
            <div className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-slate-600 md:text-[0.75rem]">
              Code Editor
            </div>
            <div style={{ height: 'calc(100% - 24px)' }}>{editor}</div>
          </div>
          <div
            className="relative w-full min-w-0 overflow-hidden rounded-xl border border-slate-600/50 bg-gradient-to-br from-gray-800 to-gray-900 p-2 shadow-md hover:-translate-y-0.5 hover:shadow-xl transition-all"
            style={{ height: `min(max(150px, ${height * 0.35}px), ${height * 0.35}px)` }}
          >
            <div className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-green-400 md:text-[0.75rem]">
              Console Output
            </div>
            <div style={{ height: 'calc(100% - 24px)' }}>{output}</div>
          </div>
        </div>

        {/* Right column: canvas */}
        <div
          className="relative min-w-0 rounded-xl shadow-lg transition-all md:hover:-translate-y-1 md:hover:shadow-xl lg:w-[56%]"
          style={{ height: `${height}px` }}
        >
          <div className="sticky top-0 z-10 mb-1 rounded-t-xl border-b bg-white/95 px-3 py-2 backdrop-blur">
            <div className="text-[0.8rem] font-semibold uppercase tracking-wide text-slate-700">
              Live Visualization
            </div>
          </div>
          {canvas}
        </div>
      </div>
    </div>
  );
};

export default TwoDLayout;
