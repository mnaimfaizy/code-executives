import React from 'react';
import {
  Box,
  Grid2x2,
  Hand,
  LocateFixed,
  Maximize2,
  Minimize2,
  Pin,
  Scan,
  Square,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from 'lucide-react';
import type { CameraCommandInput, ViewPreset } from './viewerCamera';

export interface Viewer3DToolbarProps {
  /** The toolbar renders only in 3D; 2D puts Full screen in the story's control row. */
  is3D: boolean;
  preset: ViewPreset;
  hold: boolean;
  pan: boolean;
  command: (c: CameraCommandInput) => void;
  setPreset: (preset: ViewPreset) => void;
  toggleHold: () => void;
  togglePan: () => void;
  reset: () => void;
  fullscreen: { supported: boolean; isFullscreen: boolean; toggle: () => void };
}

const PRESETS: { id: ViewPreset; label: string; icon: LucideIcon }[] = [
  { id: 'iso', label: 'Isometric view', icon: Box },
  { id: 'front', label: 'Front view', icon: Square },
  { id: 'top', label: 'Top view', icon: Grid2x2 },
];

const base =
  'flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500';
const idle = 'text-slate-700 hover:bg-slate-100';
const on = 'bg-slate-800 text-white hover:bg-slate-700';

const ToolButton: React.FC<{
  label: string;
  shortcut?: string;
  keys?: string;
  icon: LucideIcon;
  onClick: () => void;
  pressed?: boolean;
}> = ({ label, shortcut, keys, icon: Icon, onClick, pressed }) => (
  <button
    type="button"
    aria-label={label}
    title={shortcut ? `${label} (${shortcut})` : label}
    aria-keyshortcuts={keys}
    aria-pressed={pressed}
    onClick={onClick}
    className={`${base} ${pressed ? on : idle}`}
  >
    <Icon className="h-4 w-4" aria-hidden />
  </button>
);

const Divider: React.FC = () => <div className="mx-1 my-0.5 h-px bg-slate-200" aria-hidden />;

/**
 * The viewer's camera controls: a vertical strip in the viewer's top-right corner. Place it
 * inside a `relative` viewer; it is three-free, so sections import it directly.
 */
const Viewer3DToolbar: React.FC<Viewer3DToolbarProps> = ({
  is3D,
  preset,
  hold,
  pan,
  command,
  setPreset,
  toggleHold,
  togglePan,
  reset,
  fullscreen,
}) => {
  // In 2D the full-screen button lives in the story's control row, where it can't cover the diagram.
  if (!is3D) return null;
  return (
    <div
      role="toolbar"
      aria-label="Viewer controls"
      aria-orientation="vertical"
      className="absolute right-2 top-2 z-20 flex flex-col gap-0.5 rounded-lg border border-slate-300 bg-white/90 p-1 shadow-sm backdrop-blur-sm"
    >
      <ToolButton
        label="Zoom in"
        shortcut="+"
        keys="+"
        icon={ZoomIn}
        onClick={() => command({ kind: 'zoomIn' })}
      />
      <ToolButton
        label="Zoom out"
        shortcut="-"
        keys="-"
        icon={ZoomOut}
        onClick={() => command({ kind: 'zoomOut' })}
      />
      <ToolButton label="Fit" icon={Scan} onClick={() => command({ kind: 'fit' })} />
      <ToolButton label="Pan mode" icon={Hand} pressed={pan} onClick={togglePan} />
      <Divider />
      <div role="radiogroup" aria-label="View preset" className="flex flex-col gap-0.5">
        {PRESETS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={preset === id}
            aria-label={label}
            title={label}
            onClick={() => setPreset(id)}
            className={`${base} ${preset === id ? on : idle}`}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </button>
        ))}
      </div>
      <Divider />
      <ToolButton
        label="Hold view"
        shortcut="H"
        keys="H"
        icon={Pin}
        pressed={hold}
        onClick={toggleHold}
      />
      <ToolButton label="Reset view" shortcut="0" keys="0" icon={LocateFixed} onClick={reset} />
      {fullscreen.supported && (
        <>
          <Divider />
          <ToolButton
            label={fullscreen.isFullscreen ? 'Exit full screen' : 'Full screen'}
            shortcut="F"
            keys="F"
            icon={fullscreen.isFullscreen ? Minimize2 : Maximize2}
            onClick={fullscreen.toggle}
          />
        </>
      )}
    </div>
  );
};

export default Viewer3DToolbar;
