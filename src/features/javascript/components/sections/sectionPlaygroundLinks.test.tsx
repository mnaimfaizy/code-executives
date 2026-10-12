import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CallStack from './CallStack';
import EventLoop from './EventLoop';
import MemoryLeaks from './MemoryLeaks';
import TaskQueues from './TaskQueues';
import WebAPIs from './WebAPIs';
import { playgroundHref } from '../../../playground/utils/playgroundLink';
import {
  allQueueTypesSample,
  asyncAwaitOrderSample,
  betweenMacrotasksSample,
  callStackSample,
  circularReferencesSolutionSample,
  clearedTimersSolutionSample,
  microtaskStarvationSample,
  nestedPromisesSample,
  promiseVsTimeoutSample,
  queueMicrotaskSample,
  sectionSamples,
  timerApisSample,
  type SectionSample,
} from '../../utils/sectionSamples';

const show = (section: React.ReactElement) => render(<MemoryRouter>{section}</MemoryRouter>);

/** The links a sample's code sits beside: none, or the one that opens that sample. */
const sampleLinks = (): HTMLElement[] =>
  screen
    .queryAllByRole('link', { name: /Try it in the Playground/ })
    // The Event Loop story's own link is the story's, not a sample's
    .filter((link) => !link.getAttribute('href')!.includes('example=event-loop-story'));

function expectLinkTo(sample: SectionSample): void {
  const links = sampleLinks();
  expect(links).toHaveLength(1);
  expect(links[0]).toHaveAttribute(
    'href',
    playgroundHref({ example: sample.example, lens: sample.lens })
  );
  expect(links[0]).toHaveAttribute('target', '_blank');
  // The code the link opens is the code on the page beside it
  expect(
    screen.getAllByText((_, element) => element?.textContent === sample.code).length
  ).toBeGreaterThan(0);
  expect(links[0].closest('[data-testid="try-in-playground"]')).toHaveTextContent(sample.tryIt);
}

const choose = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));

afterEach(() => {
  vi.useRealTimers();
});

describe('the JavaScript sections’ links into the Playground', () => {
  it('Call Stack & Execution links its JavaScript example', () => {
    show(<CallStack />);
    const links = sampleLinks();
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute(
      'href',
      playgroundHref({ example: callStackSample.example, lens: callStackSample.lens })
    );
  });

  it('Event Loop & Coordination links each of its four samples, one at a time', () => {
    show(<EventLoop />);
    expectLinkTo(promiseVsTimeoutSample);
    choose('Nested Promises');
    expectLinkTo(nestedPromisesSample);
    choose('async/await Order');
    expectLinkTo(asyncAwaitOrderSample);
    choose('queueMicrotask');
    expectLinkTo(queueMicrotaskSample);
  });

  it('Task Queues & Priority links the samples that run in the Playground, and not the rAF one', () => {
    show(<TaskQueues />);
    expectLinkTo(allQueueTypesSample);
    choose('Microtask Starvation');
    expectLinkTo(microtaskStarvationSample);
    choose('requestAnimationFrame');
    expect(sampleLinks()).toHaveLength(0);
    choose('Microtasks Between Macrotasks');
    expectLinkTo(betweenMacrotasksSample);
  });

  it('Web APIs & Platform links its timer sample only', () => {
    show(<WebAPIs />);
    expect(sampleLinks()).toHaveLength(0);
    choose('Timer APIs');
    expectLinkTo(timerApisSample);
    choose('DOM API');
    expect(sampleLinks()).toHaveLength(0);
    choose('File System (Node.js)');
    expect(sampleLinks()).toHaveLength(0);
  });

  it('Memory Leaks links the two solutions that run in the Playground', () => {
    // The section's buttons are disabled while its own animation plays
    vi.useFakeTimers();
    const settle = () => act(() => void vi.advanceTimersByTime(10_000));
    show(<MemoryLeaks />);
    settle();
    expect(sampleLinks()).toHaveLength(0);
    choose(/Circular Reference Memory Leak/);
    settle();
    expectLinkTo(circularReferencesSolutionSample);
    choose(/Global Variable Accumulation/);
    settle();
    expect(sampleLinks()).toHaveLength(0);
    choose(/Timer and Interval Leaks/);
    settle();
    expectLinkTo(clearedTimersSolutionSample);
  });

  it('covers every sample', () => {
    expect(sectionSamples).toHaveLength(11);
  });
});
