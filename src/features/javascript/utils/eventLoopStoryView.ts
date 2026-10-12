/**
 * What the Event Loop story hands the shared event loop views for one beat. The 2D and the 3D
 * wrapper both draw from this, so they cannot disagree about a beat.
 */
import { extentOf } from '../../../shared/components/viz/eventloop/layout';
import type { EventLoopViewProps } from '../../../shared/components/viz/eventloop/types';
import { STORY_BEATS, runningEntry, type StoryBeat } from './eventLoopStory';

/** Every beat is laid out for the whole story, so no region changes size from beat to beat. */
export const STORY_EXTENT = extentOf(STORY_BEATS);

export const drawingOf = (
  beat: StoryBeat
): Pick<EventLoopViewProps, 'snapshot' | 'focus' | 'extent' | 'running'> => ({
  snapshot: beat,
  focus: beat.focus,
  extent: STORY_EXTENT,
  running: runningEntry(beat),
});
