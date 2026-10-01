import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import ScenarioGallery, { type ScenarioEntry } from './ScenarioGallery';

const SCENARIOS: ScenarioEntry[] = [
  {
    id: 'ship-a-feature',
    title: 'Shipping a feature with your team',
    summary: 'You build search on a branch.',
    cast: [
      { id: 'you', name: 'You', role: 'developer' },
      { id: 'ci', name: 'CI runner', role: 'bot' },
    ],
    concepts: ['Core Workflow', 'Branching & Merging'],
    choicePoints: 1,
    component: () => <div data-testid="scenario-body">scenario body</div>,
  },
];

const LocationProbe = () => {
  const { pathname, search } = useLocation();
  return <output data-testid="location">{pathname + search}</output>;
};

const renderAt = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <ScenarioGallery scenarios={SCENARIOS} />
      <LocationProbe />
    </MemoryRouter>
  );

const location = () => screen.getByTestId('location').textContent!;

describe('ScenarioGallery', () => {
  it('shows cards with cast, concepts linked to their sections and choice points', () => {
    renderAt('/git?section=Visualization');
    expect(screen.getByRole('heading', { name: 'Scenarios' })).toBeInTheDocument();
    expect(screen.getByText('Shipping a feature with your team')).toBeInTheDocument();
    expect(screen.getByText('CI runner')).toBeInTheDocument();
    expect(screen.getByText('1 choice point')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Branching & Merging' })).toHaveAttribute(
      'href',
      '/git?section=Branching%20%26%20Merging'
    );
    expect(screen.queryByTestId('scenario-body')).not.toBeInTheDocument();
  });

  it('opens a scenario from its deep link', () => {
    renderAt('/git?section=Visualization&scenario=ship-a-feature');
    expect(screen.getByTestId('scenario-body')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Scenarios' })).not.toBeInTheDocument();
  });

  it('shows the gallery for an unknown scenario id', () => {
    renderAt('/git?section=Visualization&scenario=nope');
    expect(screen.getByRole('heading', { name: 'Scenarios' })).toBeInTheDocument();
    expect(screen.queryByTestId('scenario-body')).not.toBeInTheDocument();
  });

  it('opening and closing a card keeps the other search params', async () => {
    const user = userEvent.setup();
    renderAt('/git?section=Visualization&utm=x');

    await user.click(screen.getByRole('button', { name: /Open scenario/ }));
    expect(screen.getByTestId('scenario-body')).toBeInTheDocument();
    const params = new URLSearchParams(location().split('?')[1]);
    expect(params.get('section')).toBe('Visualization');
    expect(params.get('utm')).toBe('x');
    expect(params.get('scenario')).toBe('ship-a-feature');

    await user.click(screen.getByRole('button', { name: 'All scenarios' }));
    expect(location()).toBe('/git?section=Visualization&utm=x');
  });
});
