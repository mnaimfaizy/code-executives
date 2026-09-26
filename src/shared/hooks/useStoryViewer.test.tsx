import { describe, expect, it, vi } from 'vitest';
import { useRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useStoryViewer, type StoryViewer } from './useStoryViewer';

let latest: StoryViewer;

const Harness: React.FC<{ is3D: boolean; step: (d: number) => void }> = ({ is3D, step }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewer = useStoryViewer({ rootRef, is3D, step });
  latest = viewer;
  return (
    <div ref={rootRef} tabIndex={0} aria-label="story" onKeyDown={viewer.onKeyDown}>
      <select aria-label="speed" defaultValue="a">
        <option value="a">a</option>
        <option value="b">b</option>
      </select>
    </div>
  );
};

const setup = (is3D = true) => {
  const step = vi.fn();
  render(<Harness is3D={is3D} step={step} />);
  screen.getByLabelText('story').focus();
  return { step, user: userEvent.setup() };
};

describe('useStoryViewer keyboard', () => {
  it('steps with plain arrows and never orbits', async () => {
    const { step, user } = setup();
    await user.keyboard('{ArrowRight}{ArrowLeft}');
    expect(step).toHaveBeenNthCalledWith(1, 1);
    expect(step).toHaveBeenNthCalledWith(2, -1);
    expect(latest.camera.command).toBeNull();
  });

  it('orbits with Shift + arrows in 3D instead of stepping', async () => {
    const { step, user } = setup();
    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    expect(latest.camera.command).toMatchObject({ kind: 'orbit', dir: 'left' });
    const first = latest.camera.command!.token;
    await user.keyboard('{Shift>}{ArrowUp}{/Shift}');
    expect(latest.camera.command).toMatchObject({ kind: 'orbit', dir: 'up' });
    expect(latest.camera.command!.token).not.toBe(first);
    expect(step).not.toHaveBeenCalled();
  });

  it('toggles Hold view with H, zooms with + and -, and resets with 0', async () => {
    const { user } = setup();
    await user.keyboard('h');
    expect(latest.camera.hold).toBe(true);
    await user.keyboard('H');
    expect(latest.camera.hold).toBe(false);

    await user.keyboard('+');
    expect(latest.camera.command).toMatchObject({ kind: 'zoomIn' });
    await user.keyboard('-');
    expect(latest.camera.command).toMatchObject({ kind: 'zoomOut' });

    await user.keyboard('h');
    await user.keyboard('0');
    expect(latest.camera).toMatchObject({ preset: 'iso', hold: false, command: { kind: 'reset' } });
  });

  it('ignores camera keys in 2D, modified keys, and keys typed into form controls', async () => {
    const { step, user } = setup(false);
    await user.keyboard('h+');
    expect(latest.camera.hold).toBe(false);
    expect(latest.camera.command).toBeNull();

    await user.keyboard('{Control>}{ArrowRight}{/Control}');
    expect(step).not.toHaveBeenCalled();

    screen.getByLabelText('speed').focus();
    await user.keyboard('{ArrowRight}');
    expect(step).not.toHaveBeenCalled();
  });
});
