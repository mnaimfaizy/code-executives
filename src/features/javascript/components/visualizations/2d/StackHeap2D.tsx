import React from 'react';
import type { StoryBeat } from '../../../utils/stackHeapStory';
import StackHeapView2D from '../../../../../shared/components/viz/stackheap/StackHeapView2D';

interface StackHeap2DProps {
  beat: StoryBeat;
}

/** The Stack ↔ Heap story's 2D view: the shared stack-and-heap view, drawing one beat. */
const StackHeap2D: React.FC<StackHeap2DProps> = ({ beat }) => (
  <StackHeapView2D
    snapshot={beat}
    focus={beat.focus}
    gcPhase={beat.gcPhase}
    label={`Stack and heap: ${beat.title}`}
  />
);

export default StackHeap2D;
