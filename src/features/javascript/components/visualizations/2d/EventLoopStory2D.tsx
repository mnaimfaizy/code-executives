import React from 'react';
import type { ShotId, StoryBeat } from '../../../utils/eventLoopStory';
import { drawingOf } from '../../../utils/eventLoopStoryView';
import EventLoopView2D from '../../../../../shared/components/viz/eventloop/EventLoopView2D';
import type { EventLoopRegion } from '../../../../../shared/components/viz/eventloop/layout';

interface EventLoopStory2DProps {
  beat: StoryBeat;
}

/**
 * All four regions fit in 2D, so a shot only says which of them the beat is about. The overview
 * is about all of them, which draws them alike.
 */
const SHOT_REGIONS: Record<ShotId, readonly EventLoopRegion[]> = {
  overview: [],
  stack: ['stack'],
  'timers-tasks': ['tasks', 'timers'],
  'stack-microtasks': ['stack', 'microtasks'],
  'stack-tasks': ['stack', 'tasks'],
};

/** The Event Loop story's 2D view: the shared event loop view, drawing one beat. */
const EventLoopStory2D: React.FC<EventLoopStory2DProps> = ({ beat }) => (
  <EventLoopView2D
    {...drawingOf(beat)}
    emphasis={SHOT_REGIONS[beat.shot]}
    label={`Event loop: ${beat.title}`}
  />
);

export default EventLoopStory2D;
