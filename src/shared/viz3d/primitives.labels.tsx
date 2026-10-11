/**
 * DOM label cards for story 3D renderers.
 *
 * THREE.JS SIDE: this module imports drei. Import it ONLY from `src/shared/viz3d/` or a
 * renderer that a story section loads with `React.lazy`.
 */
import React from 'react';
import { Html } from '@react-three/drei';
import type { V3 } from '../components/viz/viewerCamera';
import { labelStyle } from './primitives';

export interface LabelProps {
  position: V3;
  /** CSS transform that anchors the card to its world point, e.g. `translate(-50%, -100%)`. */
  anchor: string;
  /** The card's own opacity (exit fades, dimming). LabelFramer owns the inner element's. */
  opacity?: number;
  /** Reduced motion: no transitions. */
  instant: boolean;
  /** Duration of the `opacity` transition. */
  fadeMs?: number;
  /** Classes of the card (padding, border, type size). Colours go in `style`. */
  className?: string;
  style?: React.CSSProperties;
  /** Extra attributes on the card, e.g. `data-*` markers. */
  attrs?: Record<string, string>;
  children: React.ReactNode;
}

/**
 * A DOM label pinned to a world point. The outer box carries fade-in/out; the inner box is the
 * `data-viz-label` that LabelFramer hides whenever it would be cut by the viewer's edge.
 */
export const Label: React.FC<LabelProps> = ({
  position,
  anchor,
  opacity = 1,
  instant,
  fadeMs = 400,
  className = '',
  style,
  attrs,
  children,
}) => (
  <Html position={position} zIndexRange={[10, 0]}>
    <div
      style={{
        ...labelStyle,
        transform: anchor,
        opacity,
        transition: instant ? undefined : `opacity ${fadeMs}ms`,
      }}
    >
      <div
        data-viz-label
        {...attrs}
        style={{ transition: instant ? undefined : 'opacity 200ms', ...style }}
        className={`rounded-md shadow-sm ${className}`}
      >
        {children}
      </div>
    </div>
  </Html>
);

/** A region's caption ("CALL STACK", "HEAP"): framed by LabelFramer, not counted as a label. */
export const RegionLabel: React.FC<{
  position: V3;
  color: string;
  /** CSS transform anchoring the caption; centred under its point by default. */
  anchor?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ position, color, anchor = 'translate(-50%, 0)', style, children }) => (
  <Html position={position} zIndexRange={[10, 0]}>
    <div
      data-viz-framed
      style={{ ...labelStyle, transform: anchor, color, ...style }}
      className="text-[11px] font-bold tracking-[0.2em]"
    >
      {children}
    </div>
  </Html>
);
