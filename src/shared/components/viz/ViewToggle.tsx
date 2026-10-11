import React from 'react';
import { Box, Square } from 'lucide-react';
import type { VizTheme } from '../../viz/palette';
import type { VizView } from '../../hooks/useViewChoice';

export interface ViewToggleProps {
  view: VizView;
  onChange: (view: VizView) => void;
  /** False disables the 3D option and says why. */
  webgl: boolean;
  /** Stories are light; the Playground is dark. Default `light`. */
  theme?: VizTheme;
}

const GROUP: Record<VizTheme, string> = {
  light: 'flex rounded-lg border border-slate-300 bg-white p-0.5 shadow-sm',
  dark: 'flex rounded-lg border border-[#2a2a4e] bg-[#12122a] p-0.5',
};
const CHECKED: Record<VizTheme, string> = {
  light: 'bg-indigo-600 text-white',
  dark: 'bg-indigo-500 text-white',
};
const IDLE: Record<VizTheme, string> = {
  light: 'text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40',
  dark: 'text-[#b8b8e0] hover:bg-[#1e1e42] disabled:cursor-not-allowed disabled:opacity-40',
};

/** The 2D/3D switch of a viewer. Switching views keeps the beat or step. */
const ViewToggle: React.FC<ViewToggleProps> = ({ view, onChange, webgl, theme = 'light' }) => (
  <div role="radiogroup" aria-label="Visualization mode" className={GROUP[theme]}>
    {(['2d', '3d'] as const).map((v) => {
      const disabled = v === '3d' && !webgl;
      return (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={view === v}
          disabled={disabled}
          title={disabled ? '3D needs WebGL, which is unavailable in this browser' : undefined}
          onClick={() => onChange(v)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            view === v ? CHECKED[theme] : IDLE[theme]
          }`}
        >
          {v === '2d' ? <Square className="h-3.5 w-3.5" /> : <Box className="h-3.5 w-3.5" />}
          {v.toUpperCase()}
        </button>
      );
    })}
  </div>
);

export default ViewToggle;
