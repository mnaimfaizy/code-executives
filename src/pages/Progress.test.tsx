import { beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import {
  PROGRESS_STORAGE_KEY,
  loadProgress,
  type ExerciseProgress,
} from '../features/playground/exercises/exerciseProgress';
import { getQuizStorageKeys } from '../utils/quiz';
import {
  PROGRESS_RECORD_STORAGE_KEY,
  milestones,
  moduleProgress,
  emptyProgressRecord,
  readStoredProgressRecord,
  type ProgressRecord,
} from '../shared/progress';
import Progress from './Progress';

const ALL = milestones().find((milestone) => milestone.id === 'exercises:all')!;
const ALL_IDS = ALL.exerciseIds!;
/** A module's exercise milestone, from the real catalog */
const MODULE = milestones().find(
  (milestone) => milestone.kind === 'exercises' && milestone.moduleId !== undefined
)!;
const MODULE_IDS = MODULE.exerciseIds!;
const QUIZ = milestones().find((milestone) => milestone.kind === 'quiz')!;
const QUIZ_MODULE = QUIZ.moduleId!;

const day = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

const storeExercises = (progress: ExerciseProgress): void =>
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));

const storeRecord = (record: Partial<ProgressRecord>): void =>
  localStorage.setItem(
    PROGRESS_RECORD_STORAGE_KEY,
    JSON.stringify({ ...emptyProgressRecord(), ...record })
  );

const passed = (ids: string[]): ExerciseProgress =>
  Object.fromEntries(ids.map((id) => [id, { passed: true as const }]));

const renderPage = (): void => {
  render(
    <MemoryRouter>
      <Progress />
    </MemoryRouter>
  );
};

const row = (milestoneId: string): HTMLElement => screen.getByTestId(`milestone-${milestoneId}`);

describe('Progress page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows a new learner every milestone as something to do, and says where progress is kept', () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Progress' })).toBeInTheDocument();
    expect(screen.getByText(/kept in this browser only/)).toHaveTextContent(
      /lost if you clear the site.s data or use another browser/
    );

    // Every milestone is listed, none hidden, none reached
    for (const milestone of milestones()) {
      expect(
        within(row(milestone.id)).getByRole('heading', { name: milestone.title })
      ).toBeInTheDocument();
    }
    expect(screen.queryByText(/^Reached/)).toBeNull();

    // An exercise milestone says what is left, with a link to each exercise in the Playground
    const all = row(ALL.id);
    expect(all).toHaveTextContent(`0 of ${ALL_IDS.length} passed`);
    const links = within(all).getAllByRole('link');
    expect(links).toHaveLength(ALL_IDS.length);
    expect(links[0]).toHaveAttribute('href', expect.stringContaining('/playground?exercise='));
    expect(links[0]).toHaveAccessibleName(/opens in the Playground/);

    // A quiz milestone says it was not taken, with a link to that module's quiz
    const quiz = row(QUIZ.id);
    expect(quiz).toHaveTextContent('No completed attempt yet.');
    expect(within(quiz).getByRole('link', { name: /^Take the .+ quiz$/ })).toHaveAttribute(
      'href',
      `/${QUIZ_MODULE}?section=Quiz`
    );

    // The visit is recorded, so what is earned later is news
    expect(readStoredProgressRecord()).toEqual(emptyProgressRecord());
  });

  it('uses none of the words the site does not say', () => {
    renderPage();
    // The page's own words: titles of exercises, modules and milestones come from elsewhere
    const own = document.body.cloneNode(true) as HTMLElement;
    own.querySelectorAll('a, h3').forEach((element) => element.remove());
    expect(own.textContent).toMatch(/Milestones.*By module.*Start over/s);
    expect(own.textContent).not.toMatch(
      /achievement|badge|gamification|streak|points|level/i
    );
  });

  it('counts what was passed and lists only what is left', () => {
    const [first, ...rest] = MODULE_IDS;
    storeExercises({ [first]: { passed: true, solutionSeen: true } });
    storeRecord({});
    renderPage();

    const milestone = row(MODULE.id);
    expect(milestone).toHaveTextContent(`1 of ${MODULE_IDS.length} passed`);
    expect(within(milestone).getAllByRole('link')).toHaveLength(rest.length);
    expect(milestone.querySelector(`a[href*="exercise=${first}"]`)).toBeNull();

    // By module: every exercise, with the Playground's own marks
    const entry = within(screen.getByTestId(`module-${MODULE.moduleId}`));
    expect(entry.getByText(`Exercises: 1 of ${MODULE_IDS.length} passed`)).toBeInTheDocument();
    expect(entry.getByTestId(`module-${MODULE.moduleId}-exercise-${first}`)).toHaveTextContent(
      /Passed, solution seen$/
    );
    expect(entry.getByTestId(`module-${MODULE.moduleId}-exercise-${rest[0]}`)).toHaveTextContent(
      /Not passed yet$/
    );
  });

  it('links each module the model reports to its page', () => {
    renderPage();
    const entries = moduleProgress(emptyProgressRecord(), {});
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      const item = within(screen.getByTestId(`module-${entry.moduleId}`));
      expect(item.getByRole('link', { name: entry.title })).toHaveAttribute('href', entry.path);
    }
  });

  it('shows the date a milestone was reached, the day only', () => {
    const earnedAt = '2026-03-04T12:00:00.000Z';
    storeExercises(passed(MODULE_IDS));
    storeRecord({ milestones: { [MODULE.id]: { earnedAt, exerciseIds: MODULE_IDS } } });
    renderPage();

    const milestone = row(MODULE.id);
    expect(milestone).toHaveTextContent(`Reached ${day(earnedAt)}`);
    expect(within(milestone).getByText(day(earnedAt))).toHaveAttribute('dateTime', earnedAt);
    expect(milestone).not.toHaveTextContent(/passed|something new/);
    expect(within(milestone).queryByRole('link')).toBeNull();
  });

  it('works out the milestones of a learner who was here before the record existed', () => {
    storeExercises(passed(MODULE_IDS));
    renderPage();
    expect(row(MODULE.id)).toHaveTextContent(/Reached /);
    expect(readStoredProgressRecord()?.milestones[MODULE.id]).toBeDefined();
  });

  it('says there is something new when exercises were added after a milestone was reached', () => {
    const added = ALL_IDS[ALL_IDS.length - 1];
    const before = ALL_IDS.slice(0, -1);
    storeExercises(passed(before));
    storeRecord({
      milestones: { [ALL.id]: { earnedAt: '2026-03-04T12:00:00.000Z', exerciseIds: before } },
    });
    renderPage();

    const milestone = row(ALL.id);
    expect(milestone).toHaveTextContent(/Reached /);
    expect(milestone).toHaveTextContent(/something new since you reached this/);
    const links = within(milestone).getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', expect.stringContaining(`exercise=${added}`));
  });

  describe('a quiz', () => {
    it('shows the best score so far while the milestone is not reached', () => {
      const completedAt = '2026-05-06T12:00:00.000Z';
      storeRecord({ bestQuiz: { [QUIZ_MODULE]: { scorePercentage: 60, completedAt } } });
      renderPage();

      const milestone = row(QUIZ.id);
      expect(milestone).toHaveTextContent('Best score so far: 60%.');
      expect(
        within(milestone).getByRole('link', { name: /^Take the .+ quiz$/ })
      ).toBeInTheDocument();
      expect(milestone).not.toHaveTextContent(/Reached/);

      const entry = screen.getByTestId(`module-${QUIZ_MODULE}`);
      expect(entry).toHaveTextContent(`Quiz: best score 60%, on ${day(completedAt)}.`);
      expect(within(entry).getByRole('link', { name: /^Take the .+ quiz$/ })).toHaveAttribute(
        'href',
        `/${QUIZ_MODULE}?section=Quiz`
      );
    });

    it('shows the date once the milestone is reached', () => {
      const completedAt = '2026-05-06T12:00:00.000Z';
      storeRecord({
        bestQuiz: { [QUIZ_MODULE]: { scorePercentage: 100, completedAt } },
        milestones: { [QUIZ.id]: { earnedAt: completedAt } },
      });
      renderPage();
      expect(row(QUIZ.id)).toHaveTextContent(`Reached ${day(completedAt)}`);
      expect(screen.getByTestId(`module-${QUIZ_MODULE}`)).toHaveTextContent(
        'Quiz: best score 100%'
      );
    });

    it('says a quiz was not taken in its module', () => {
      renderPage();
      expect(screen.getByTestId(`module-${QUIZ_MODULE}`)).toHaveTextContent('Quiz: No completed attempt yet.');
    });
  });

  it('follows a change made elsewhere, such as a pass in the Playground', () => {
    renderPage();
    expect(row(ALL.id)).toHaveTextContent(`0 of ${ALL_IDS.length} passed`);

    act(() => {
      storeExercises(passed([ALL_IDS[0]]));
      window.dispatchEvent(new StorageEvent('storage', { key: PROGRESS_STORAGE_KEY }));
    });
    expect(row(ALL.id)).toHaveTextContent(`1 of ${ALL_IDS.length} passed`);
  });

  describe('starting over', () => {
    const seed = (): void => {
      storeExercises({
        ...passed(MODULE_IDS),
        [MODULE_IDS[0]]: { passed: true, solutionSeen: true, code: '// mine' },
      });
      storeRecord({
        milestones: {
          [MODULE.id]: { earnedAt: '2026-03-04T12:00:00.000Z', exerciseIds: MODULE_IDS },
        },
        bestQuiz: {
          [QUIZ_MODULE]: { scorePercentage: 60, completedAt: '2026-05-06T12:00:00.000Z' },
        },
      });
      localStorage.setItem(getQuizStorageKeys(QUIZ_MODULE).results, JSON.stringify([]));
    };

    it('asks in the page, saying exactly what is cleared, and keeps everything on "keep"', async () => {
      const user = userEvent.setup();
      seed();
      renderPage();

      await user.click(screen.getByRole('button', { name: /^Clear my progress/ }));
      const dialog = screen.getByRole('alertdialog', { name: 'Clear your progress?' });
      expect(dialog).toHaveAccessibleDescription(
        /passed marks, your solution-seen marks, your milestones and your quiz results\. The code you wrote for exercises is kept\./
      );
      // The safe answer has the focus
      const keep = within(dialog).getByRole('button', { name: 'Keep my progress' });
      expect(keep).toHaveFocus();

      await user.click(keep);
      expect(screen.queryByRole('alertdialog')).toBeNull();
      expect(screen.getByRole('button', { name: /^Clear my progress/ })).toHaveFocus();
      expect(row(MODULE.id)).toHaveTextContent(/Reached /);
      expect(loadProgress()[MODULE_IDS[0]]?.passed).toBe(true);
    });

    it('answers "keep" on Escape', async () => {
      const user = userEvent.setup();
      seed();
      renderPage();
      await user.click(screen.getByRole('button', { name: /^Clear my progress/ }));
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('alertdialog')).toBeNull();
      expect(readStoredProgressRecord()?.milestones[MODULE.id]).toBeDefined();
    });

    it('clears on confirmation, keeps the code, and shows the page of a new learner', async () => {
      const user = userEvent.setup();
      seed();
      renderPage();

      await user.click(screen.getByRole('button', { name: /^Clear my progress/ }));
      await user.click(
        within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Clear my progress' })
      );

      expect(screen.queryByRole('alertdialog')).toBeNull();
      expect(screen.getByRole('status')).toHaveTextContent('Your progress was cleared.');
      expect(screen.getByRole('button', { name: /^Clear my progress/ })).toHaveFocus();
      expect(screen.queryByText(/^Reached/)).toBeNull();
      expect(row(MODULE.id)).toHaveTextContent(`0 of ${MODULE_IDS.length} passed`);
      expect(row(QUIZ.id)).toHaveTextContent('No completed attempt yet.');

      expect(loadProgress()).toEqual({ [MODULE_IDS[0]]: { code: '// mine' } });
      expect(readStoredProgressRecord()).toEqual(emptyProgressRecord());
      expect(localStorage.getItem(getQuizStorageKeys(QUIZ_MODULE).results)).toBeNull();
    });
  });
});
