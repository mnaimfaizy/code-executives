import React from 'react';
import type { StoryBeat } from '../../../utils/stackHeapStory';
import type { CameraState } from '../../../../../shared/components/viz/viewerCamera';
import StackHeapView3D from '../../../../../shared/viz3d/stackheap/StackHeapView3D';

/**
 * 3D renderer for the Stack & Heap story: the shared stack-and-heap view, fed one beat.
 * The story is light; the same view draws Playground traces in the dark palette (ADR 0004).
 */

export interface StackHeap3DProps {
  beat: StoryBeat;
  /** The learner's camera: view preset, Hold view, pan mode and one-shot commands. */
  camera: CameraState;
  /** Reduced motion: no tweening, instant camera cuts. */
  instant?: boolean;
}

const StackHeap3D: React.FC<StackHeap3DProps> = ({ beat, camera, instant }) => (
  <StackHeapView3D
    snapshot={beat}
    focus={beat.focus}
    gcPhase={beat.gcPhase}
    shot={beat.shot}
    label={`3D view of the stack and heap: ${beat.title}`}
    camera={camera}
    instant={instant}
  />
);

export default StackHeap3D;
