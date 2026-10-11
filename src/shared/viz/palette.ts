/**
 * The one palette for the stack-and-heap views (2D SVG and 3D), organised by role.
 *
 * Each colour means one role (docs/3D-Visualization-Standard.md, "Style"), and each role keeps
 * its hue family in both variants so a story met in light mode is recognisable in the dark
 * Playground (docs/adr/0004-playground-traces-share-the-snapshot.md, decision 6).
 *
 * Pure data: no React, no three.js, no DOM. Every value is a 6-digit hex.
 */

export type VizTheme = 'light' | 'dark';

/** One kind of thing a view draws. 2D draws a pale `fill` with a `stroke`; 3D draws a `solid`. */
export interface EntityColors {
  fill: string;
  stroke: string;
  solid: string;
}

export interface VizPalette {
  /** The viewer background behind everything. */
  surface: string;
  /** The stack and heap areas. */
  region: {
    /** 2D panel fill. */
    fill: string;
    /** 2D panel outline and the 3D heap grid. */
    stroke: string;
    /** "CALL STACK" / "HEAP" captions. */
    label: string;
    /** 3D ground plane. */
    ground: string;
    /** 3D heap floor. */
    floor: string;
    /** 3D plinth under the stack. */
    plinth: string;
  };
  /** 3D hemisphere light. Lighting, not a role: it only keeps the solids readable. */
  lighting: { sky: string; ground: string };
  /** A stack frame. */
  frame: EntityColors;
  /** The top frame: the one that is running. */
  frameActive: EntityColors;
  /** A plain heap object. */
  object: EntityColors;
  /** A heap array; `divider` marks its element boundaries in 3D. */
  array: EntityColors & { divider: string };
  /** A function object (a closure). */
  function: EntityColors;
  /** A retained scope: a frame that left the stack but is kept alive by a closure. */
  scope: EntityColors;
  /** A heap object the collector could not reach (unmarked, then reclaimed). */
  unreachable: EntityColors;
  /** A reference arrow: `stroke` in 2D, `solid` in 3D. */
  reference: { stroke: string; solid: string };
  /** What the current beat is about. */
  focus: string;
  /** A garbage-collection root. */
  root: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
    /** Text of a focused slot. */
    onFocus: string;
    /** 2D: the name heading a frame or a retained scope. */
    frameName: string;
    /** 2D: a slot's name and value. */
    slot: string;
    /** The ROOT tag on a frame. */
    root: string;
  };
  /** The DOM labels that float over the 3D scene. */
  label: {
    bg: string;
    border: string;
    /** Border of a frame's label. */
    frameBorder: string;
    /** Border of a label in focus. */
    focusBorder: string;
    /** Border of an unreachable object's label. */
    unreachableBorder: string;
  };
}

/** The entity roles, for code that treats them uniformly (and for the palette tests). */
export const ENTITY_ROLES = [
  'frame',
  'frameActive',
  'object',
  'array',
  'function',
  'scope',
  'unreachable',
] as const satisfies readonly (keyof VizPalette)[];

export type EntityRole = (typeof ENTITY_ROLES)[number];

export const vizPalette: Record<VizTheme, VizPalette> = {
  light: {
    surface: '#f8fafc',
    region: {
      fill: '#f8fafc',
      stroke: '#cbd5e1',
      label: '#64748b',
      ground: '#e2e8f0',
      floor: '#f1f5f9',
      plinth: '#cbd5e1',
    },
    lighting: { sky: '#ffffff', ground: '#cbd5e1' },
    frame: { fill: '#e0e7ff', stroke: '#6366f1', solid: '#818cf8' },
    frameActive: { fill: '#c7d2fe', stroke: '#4f46e5', solid: '#6366f1' },
    object: { fill: '#d1fae5', stroke: '#10b981', solid: '#34d399' },
    array: { fill: '#e0f2fe', stroke: '#0ea5e9', solid: '#38bdf8', divider: '#0369a1' },
    function: { fill: '#f3e8ff', stroke: '#a855f7', solid: '#c084fc' },
    scope: { fill: '#e8eaf6', stroke: '#5c6399', solid: '#9aa0c9' },
    unreachable: { fill: '#ffe4e6', stroke: '#f43f5e', solid: '#fb7185' },
    reference: { stroke: '#64748b', solid: '#475569' },
    focus: '#f59e0b',
    root: '#f59e0b',
    text: {
      primary: '#1e293b',
      secondary: '#475569',
      muted: '#94a3b8',
      onFocus: '#b45309',
      frameName: '#312e81',
      slot: '#334155',
      root: '#d97706',
    },
    label: {
      bg: '#ffffff',
      border: '#e2e8f0',
      frameBorder: '#c7d2fe',
      focusBorder: '#fbbf24',
      unreachableBorder: '#fda4af',
    },
  },
  dark: {
    surface: '#0a0a1a',
    region: {
      fill: '#12122a',
      stroke: '#2a2a4e',
      label: '#a0a0cc',
      ground: '#0f0f2e',
      floor: '#12122a',
      plinth: '#2a2a4e',
    },
    lighting: { sky: '#ffffff', ground: '#3a3a6e' },
    frame: { fill: '#1e1b4b', stroke: '#818cf8', solid: '#6366f1' },
    frameActive: { fill: '#312e81', stroke: '#a5b4fc', solid: '#818cf8' },
    object: { fill: '#043d2e', stroke: '#34d399', solid: '#10b981' },
    array: { fill: '#093a56', stroke: '#38bdf8', solid: '#0ea5e9', divider: '#bae6fd' },
    function: { fill: '#3b0764', stroke: '#c084fc', solid: '#a855f7' },
    scope: { fill: '#262a45', stroke: '#8b93c9', solid: '#5c6399' },
    unreachable: { fill: '#4c0519', stroke: '#fb7185', solid: '#f43f5e' },
    reference: { stroke: '#94a3b8', solid: '#94a3b8' },
    focus: '#fbbf24',
    root: '#fbbf24',
    text: {
      primary: '#e0e0ff',
      secondary: '#b8b8e0',
      muted: '#a3a3cf',
      onFocus: '#fcd34d',
      frameName: '#c7d2fe',
      slot: '#cbd5e1',
      root: '#fbbf24',
    },
    label: {
      bg: '#12122a',
      border: '#2a2a4e',
      frameBorder: '#4f46e5',
      focusBorder: '#fbbf24',
      unreachableBorder: '#be123c',
    },
  },
};
