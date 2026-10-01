import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Viewer3DToolbar, { type Viewer3DToolbarProps } from './Viewer3DToolbar';

const setup = (overrides: Partial<Viewer3DToolbarProps> = {}) => {
  const props: Viewer3DToolbarProps = {
    is3D: true,
    preset: 'iso',
    hold: false,
    pan: false,
    command: vi.fn(),
    setPreset: vi.fn(),
    toggleHold: vi.fn(),
    togglePan: vi.fn(),
    reset: vi.fn(),
    fullscreen: { supported: true, isFullscreen: false, toggle: vi.fn() },
    ...overrides,
  };
  render(<Viewer3DToolbar {...props} />);
  return props;
};

describe('Viewer3DToolbar', () => {
  it('labels every control and names its shortcut in the tooltip', () => {
    setup();
    for (const [name, title] of [
      ['Zoom in', 'Zoom in (+)'],
      ['Zoom out', 'Zoom out (-)'],
      ['Fit', 'Fit'],
      ['Pan mode', 'Pan mode'],
      ['Hold view', 'Hold view (H)'],
      ['Reset view', 'Reset view (0)'],
      ['Full screen', 'Full screen (F)'],
    ])
      expect(screen.getByRole('button', { name })).toHaveAttribute('title', title);
    const presets = screen.getByRole('radiogroup', { name: 'View preset' });
    expect(presets).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Isometric view' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByRole('radio', { name: 'Front view' })).toHaveAttribute(
      'aria-checked',
      'false'
    );
  });

  it('renders nothing in 2D', () => {
    setup({ is3D: false });
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
  });

  it('fires commands and toggles', async () => {
    const user = userEvent.setup();
    const props = setup({ hold: true });

    await user.click(screen.getByRole('button', { name: 'Zoom in' }));
    await user.click(screen.getByRole('button', { name: 'Zoom out' }));
    await user.click(screen.getByRole('button', { name: 'Fit' }));
    expect(props.command).toHaveBeenNthCalledWith(1, { kind: 'zoomIn' });
    expect(props.command).toHaveBeenNthCalledWith(2, { kind: 'zoomOut' });
    expect(props.command).toHaveBeenNthCalledWith(3, { kind: 'fit' });

    await user.click(screen.getByRole('radio', { name: 'Top view' }));
    expect(props.setPreset).toHaveBeenCalledWith('top');

    expect(screen.getByRole('button', { name: 'Hold view' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Pan mode' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    await user.click(screen.getByRole('button', { name: 'Hold view' }));
    await user.click(screen.getByRole('button', { name: 'Pan mode' }));
    await user.click(screen.getByRole('button', { name: 'Reset view' }));
    await user.click(screen.getByRole('button', { name: 'Full screen' }));
    expect(props.toggleHold).toHaveBeenCalledOnce();
    expect(props.togglePan).toHaveBeenCalledOnce();
    expect(props.reset).toHaveBeenCalledOnce();
    expect(props.fullscreen.toggle).toHaveBeenCalledOnce();
  });
});
