import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ComponentExplorer from './ComponentExplorer';

describe('ComponentExplorer', () => {
  it('is headed as an explorer, not a playground', () => {
    render(<ComponentExplorer />);

    expect(
      screen.getByRole('heading', { name: 'Component Composition Explorer' })
    ).toBeInTheDocument();
    expect(screen.queryByText(/playground/i)).not.toBeInTheDocument();
  });
});
