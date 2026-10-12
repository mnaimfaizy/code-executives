import React from 'react';
import type { StoryBeat } from '../../../utils/eventLoopStory';
import { drawingOf } from '../../../utils/eventLoopStoryView';
import type { CameraState } from '../../../../../shared/components/viz/viewerCamera';
import EventLoopView3D from '../../../../../shared/viz3d/eventloop/EventLoopView3D';

/**
 * 3D renderer for the Event Loop story: the shared event loop view, fed one beat and framed by
 * the beat's shot. The story is light; the same view draws Playground traces in the dark
 * palette (ADR 0004).
 *
 * THREE.JS SIDE: the story section loads this only through `React.lazy`.
 */

export interface EventLoop3DProps {
  beat: StoryBeat;
  /** The learner's camera: view preset, Hold view, pan mode and one-shot commands. */
  camera: CameraState;
  /** Reduced motion: no tweening, instant camera cuts. */
  instant?: boolean;
}

const EventLoop3D: React.FC<EventLoop3DProps> = ({ beat, camera, instant }) => (
  <EventLoopView3D
    {...drawingOf(beat)}
    shot={beat.shot}
    label={`3D view of the event loop: ${beat.title}`}
    camera={camera}
    instant={instant}
  />
);

export default EventLoop3D;
