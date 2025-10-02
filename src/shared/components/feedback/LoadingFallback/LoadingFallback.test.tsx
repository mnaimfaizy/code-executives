import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingFallback } from './LoadingFallback';

describe('LoadingFallback', () => {
  it('renders spinner variant by default', () => {
    render(<LoadingFallback />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<LoadingFallback message="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('renders minimal variant', () => {
    const { container } = render(<LoadingFallback variant="minimal" />);
    // Minimal variant should have less padding
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('p-4');
  });

  it('has accessible loading indicator', () => {
    render(<LoadingFallback />);
    // The loader icon should be visible and indicate loading
    const loadingText = screen.getByText('Loading...');
    expect(loadingText).toBeVisible();
  });
});
