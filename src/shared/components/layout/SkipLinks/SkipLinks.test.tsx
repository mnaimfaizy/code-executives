/**
 * SkipLinks Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SkipLinks } from './SkipLinks';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('SkipLinks', () => {
  it('should render skip to main content link', () => {
    renderWithRouter(<SkipLinks />);
    
    const mainLink = screen.getByText('Skip to main content');
    expect(mainLink).toBeInTheDocument();
    expect(mainLink).toHaveAttribute('href', '#main-content');
  });

  it('should render skip to navigation link', () => {
    renderWithRouter(<SkipLinks />);
    
    const navLink = screen.getByText('Skip to navigation');
    expect(navLink).toBeInTheDocument();
    expect(navLink).toHaveAttribute('href', '#navigation');
  });

  it('should have skip-link class for styling', () => {
    renderWithRouter(<SkipLinks />);
    
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link).toHaveClass('skip-link');
    });
  });

  it('should be keyboard accessible', () => {
    renderWithRouter(<SkipLinks />);
    
    const mainLink = screen.getByText('Skip to main content');
    expect(mainLink).toHaveAttribute('href');
  });

  it('should render as nav element', () => {
    const { container } = renderWithRouter(<SkipLinks />);
    
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });
});
