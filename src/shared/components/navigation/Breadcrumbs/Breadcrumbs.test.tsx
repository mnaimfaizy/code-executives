/**
 * Breadcrumbs Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs';

// Mock useLocation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({
      pathname: '/javascript/closures',
    }),
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Breadcrumbs', () => {
  it('should render breadcrumbs navigation', () => {
    renderWithRouter(<Breadcrumbs />);

    const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(nav).toBeInTheDocument();
  });

  it('should render Home link', () => {
    renderWithRouter(<Breadcrumbs />);

    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should render path segments', () => {
    renderWithRouter(<Breadcrumbs />);

    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Closures')).toBeInTheDocument();
  });

  it('should mark current page with aria-current', () => {
    renderWithRouter(<Breadcrumbs />);

    const currentPage = screen.getByText('Closures').closest('span');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });

  it('should format kebab-case paths to Title Case', () => {
    renderWithRouter(<Breadcrumbs />);

    // "closures" should be rendered as "Closures"
    expect(screen.getByText('Closures')).toBeInTheDocument();
  });

  it('should render separators between breadcrumb items', () => {
    const { container } = renderWithRouter(<Breadcrumbs />);

    // Should have ChevronRight icons as separators
    const separators = container.querySelectorAll('svg');
    expect(separators.length).toBeGreaterThan(0);
  });

  it('should apply custom className', () => {
    const { container } = renderWithRouter(<Breadcrumbs className="custom-class" />);

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('custom-class');
  });
});
