/**
 * ProgressIndicator Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressIndicator } from './ProgressIndicator';

describe('ProgressIndicator', () => {
  it('should render progress bar', () => {
    render(<ProgressIndicator current={50} total={100} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
  });

  it('should display correct percentage', () => {
    render(<ProgressIndicator current={75} total={100} showPercentage />);

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should display fraction when showPercentage is false', () => {
    render(<ProgressIndicator current={3} total={4} showPercentage={false} />);

    expect(screen.getByText('3/4')).toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    render(<ProgressIndicator current={60} total={100} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '60');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('should display custom label', () => {
    render(<ProgressIndicator current={50} total={100} label="Progress: " />);

    expect(screen.getByText('Progress:')).toBeInTheDocument();
  });

  it('should apply blue color scheme', () => {
    const { container } = render(<ProgressIndicator current={50} total={100} colorScheme="blue" />);

    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar?.querySelector('div')).toHaveClass('bg-blue-600');
  });

  it('should apply green color scheme', () => {
    const { container } = render(
      <ProgressIndicator current={50} total={100} colorScheme="green" />
    );

    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar?.querySelector('div')).toHaveClass('bg-green-600');
  });

  it('should calculate percentage correctly', () => {
    render(<ProgressIndicator current={33} total={100} showPercentage />);

    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  it('should handle edge case of 0 total', () => {
    render(<ProgressIndicator current={0} total={0} showPercentage />);

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should handle 100% completion', () => {
    render(<ProgressIndicator current={100} total={100} showPercentage />);

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ProgressIndicator current={50} total={100} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should have accessible aria-label', () => {
    render(<ProgressIndicator current={50} total={100} label="Loading progress" />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-label', 'Loading progress');
  });
});
