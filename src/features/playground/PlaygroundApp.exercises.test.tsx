/**
 * PlaygroundApp: links, exercises, the Task and Console tabs.
 *
 * The heavy children are mocked as in PlaygroundApp.test.tsx. The checks are not: `runCheck`
 * goes to the real sandbox script, so Check here is what the learner gets.
 */
import React from 'react';
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent, waitFor, within } from '@testing-library/react';
import { installSandbox, runCheckInSandbox } from './exercises/sandboxForTests';
import { exercises } from './exercises/exercises';
import { examples } from './utils/examples';
import { getDefaultTemplate } from './utils/codeTemplates';
import { sourceOf } from './utils/playgroundStart';
import { loadProgress, PROGRESS_STORAGE_KEY } from './exercises/exerciseProgress';
import { traceSync } from './tracer';
import { milestones, readStoredProgressRecord } from '../../shared/progress';

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  runCheck: vi.fn(),
  reportError: vi.fn(),
  /** What the mock editor's buttons type */
  typed: { solution: '', own: 'let mine = 1;', broken: 'function twoSum( {', throwing: '' },
}));

vi.mock('./components/editor/MonacoEditor', () => ({
  __esModule: true,
  default: ({
    code,
    onChange,
    highlightLine,
  }: {
    code: string;
    onChange: (code: string) => void;
    highlightLine?: number;
  }) => (
    <div>
      <pre data-testid="mock-editor" data-line={highlightLine}>
        {code}
      </pre>
      <button onClick={() => onChange(mocks.typed.solution)}>type the solution</button>
      <button onClick={() => onChange(mocks.typed.own)}>type my own code</button>
      <button onClick={() => onChange(mocks.typed.broken)}>type broken code</button>
      <button onClick={() => onChange(mocks.typed.throwing)}>type throwing code</button>
    </div>
  ),
}));

vi.mock('./components/execution/SandboxFrame', () => {
  const SandboxFrame = React.forwardRef((_: unknown, ref: React.Ref<unknown>) => {
    React.useImperativeHandle(ref, () => ({ execute: vi.fn(), terminate: vi.fn() }));
    return <iframe data-testid="mock-sandbox" title="sandbox" />;
  });
  SandboxFrame.displayName = 'SandboxFrame';
  return { __esModule: true, default: SandboxFrame };
});

vi.mock('./components/theme/SpaceBackground', () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock('./components/visualizations/VisualizationCanvas', () => ({
  __esModule: true,
  default: ({ lens, steps }: { lens: string; steps: unknown[] }) => (
    <div data-testid="mock-visualization" data-lens={lens} data-steps={steps.length} />
  ),
}));

vi.mock('./components/theme/playground-theme.css', () => ({}));

vi.mock('./hooks/usePyodide', () => ({
  usePyodide: () => ({
    runPython: vi.fn().mockResolvedValue({ error: null, trace: null }),
    runPythonInstrumented: vi.fn().mockResolvedValue({ error: null, trace: null }),
    loadingState: { status: 'idle' },
    isReady: false,
    isRunning: false,
    entries: [],
    clearEntries: vi.fn(),
    error: null,
    preload: vi.fn(),
  }),
}));

vi.mock('./hooks/useSandbox', () => ({
  useSandbox: () => ({
    sandboxRef: { current: null },
    execute: mocks.execute,
    runCheck: mocks.runCheck,
    reportError: mocks.reportError,
    terminate: vi.fn(),
    isRunning: false,
    entries: [],
    clearEntries: vi.fn(),
    error: null,
  }),
}));

vi.mock('./hooks/usePaneLayout', () => ({
  usePaneLayout: () => ({ dividers: [0.3, 0.78], setDivider: vi.fn(), resetDividers: vi.fn() }),
}));

vi.mock('./components/layout/SettingsPanel', () => ({ __esModule: true, default: () => null }));

vi.mock('./components/layout/playgroundSettings', () => ({
  __esModule: true,
  loadSettings: () => ({
    fontSize: 14,
    wordWrap: true,
    executionTimeoutMs: 10_000,
    animationsEnabled: true,
  }),
  saveSettings: vi.fn(),
}));

import PlaygroundApp from './PlaygroundApp';

const twoSum = exercises.find((exercise) => exercise.id === 'two-sum')!;
const TWO_SUM_SOLUTION = `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    if (seen.has(target - nums[i])) return [seen.get(target - nums[i]), i];
    seen.set(nums[i], i);
  }
}`;

const editorCode = (): string => screen.getByTestId('mock-editor').textContent ?? '';
const lens = (): string | null =>
  screen.getByTestId('mock-visualization').getAttribute('data-lens');
const tab = (name: string): HTMLElement => screen.getByRole('tab', { name: new RegExp(name) });

function open(search: string): void {
  window.history.replaceState(null, '', `/playground${search}`);
  render(<PlaygroundApp />);
}

/** Click Check and wait for the outcome to be announced */
async function check(): Promise<HTMLElement> {
  fireEvent.click(screen.getByRole('button', { name: 'Check' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Check' })).toBeEnabled());
  return screen.getByRole('status');
}

describe('PlaygroundApp exercises and links', () => {
  beforeAll(installSandbox);

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mocks.typed.solution = TWO_SUM_SOLUTION;
    mocks.typed.throwing = 'function twoSum(nums) { return nums.missing.length; }';
    mocks.execute.mockResolvedValue({ error: null, trace: null });
    mocks.runCheck.mockImplementation((code, sandboxCheck) =>
      runCheckInSandbox(code, sandboxCheck)
    );
  });

  afterEach(() => {
    window.history.replaceState(null, '', '/');
  });

  describe('a link', () => {
    it('opens free play with the Console in front when it names nothing', () => {
      open('');
      expect(editorCode()).toBe(getDefaultTemplate('javascript'));
      expect(tab('Console')).toHaveAttribute('aria-selected', 'true');
      expect(tab('Task')).toHaveAttribute('aria-selected', 'false');
      expect(lens()).toBe('none');
    });

    it('opens an exercise: its starter code, its lens, and the Task in front', () => {
      open('?exercise=two-sum');
      expect(editorCode()).toBe(twoSum.starterCode);
      expect(lens()).toBe('stack-heap');
      expect(tab('Task')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('heading', { name: 'Two Sum' })).toBeInTheDocument();
      expect(screen.getByText('Exercise: Two Sum')).toBeInTheDocument();
    });

    it('opens an exercise with the code this viewer last had for it', () => {
      localStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify({ 'two-sum': { code: '// mine' } })
      );
      open('?exercise=two-sum');
      expect(editorCode()).toBe('// mine');
    });

    it('lets lens override the suggested lens', () => {
      open('?exercise=two-sum&lens=stack-queues');
      expect(lens()).toBe('stack-queues');
    });

    it('loads an example and its suggested lens', () => {
      const example = examples.find((item) => item.suggestedLens !== 'none')!;
      open(`?example=${example.id}`);
      expect(editorCode()).toBe(example.code);
      expect(lens()).toBe(example.suggestedLens);
      expect(tab('Console')).toHaveAttribute('aria-selected', 'true');
    });

    it('falls back to the default template, silently, for an unknown id', () => {
      open('?exercise=no-such-exercise');
      expect(editorCode()).toBe(getDefaultTemplate('javascript'));
      expect(tab('Console')).toHaveAttribute('aria-selected', 'true');
      expect(mocks.reportError).not.toHaveBeenCalled();
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });

    it('links to the story of an example that has one, and to nothing otherwise', () => {
      const withStory = examples.find((item) => sourceOf(item)?.kind === 'story');
      const without = examples.find((item) => sourceOf(item) === null)!;
      open(`?example=${without.id}`);
      expect(screen.queryByRole('link', { name: /^Read the story/ })).toBeNull();
      if (!withStory) return;

      // Loading it from the menu shows the link and puts the example in the address bar
      fireEvent.click(screen.getByRole('button', { name: /Examples/ }));
      fireEvent.click(screen.getByRole('option', { name: new RegExp(`^${withStory.label}`) }));
      const link = screen.getByRole('link', { name: /^Read the story/ });
      expect(link).toHaveAttribute('href', sourceOf(withStory)!.href);
      expect(window.location.search).toBe(`?example=${withStory.id}`);
    });
  });

  describe('checking', () => {
    it('fails the starter code and passes a solution, through the real sandbox script', async () => {
      open('?exercise=two-sum');
      expect(await check()).toHaveTextContent('0 of 5 checks passed, 5 failed.');
      expect(loadProgress()['two-sum']?.passed).toBeUndefined();

      fireEvent.click(screen.getByText('type the solution'));
      expect(screen.getByText(/The code has changed since these results/)).toBeInTheDocument();
      expect(await check()).toHaveTextContent('All 5 checks passed.');
      expect(screen.getAllByText('Passed').length).toBe(5);

      // Remembered for this viewer: the pass and the code
      expect(loadProgress()['two-sum']).toEqual({ passed: true, code: TWO_SUM_SOLUTION });
      expect(screen.getByText('Passed before')).toBeInTheDocument();
      expect(mocks.reportError).not.toHaveBeenCalled();
    });

    it('sends a thrown error to the Console too, but not a hidden check’s', async () => {
      open('?exercise=two-sum');
      fireEvent.click(screen.getByText('type throwing code'));
      expect(await check()).toHaveTextContent('0 of 5 checks passed, 5 failed.');
      const reported = mocks.reportError.mock.calls.map(([message]) => message as string);
      expect(reported).toHaveLength(3);
      expect(reported[0]).toMatch(/^Check 1, twoSum\(\[2, 7, 11, 15\], 9\): TypeError: /);
      // The Console tab counts them while the Task is in front (entries are mocked empty here)
      expect(screen.getAllByText(/twoSum threw\. TypeError/)).toHaveLength(3);
    });

    it('reports a syntax error in the panel and the Console, and runs no check', async () => {
      open('?exercise=two-sum');
      fireEvent.click(screen.getByText('type broken code'));
      expect(await check()).toHaveTextContent(
        /No check ran: the code has a syntax error on line 1/
      );
      expect(mocks.runCheck).not.toHaveBeenCalled();
      const [message, line] = mocks.reportError.mock.calls[0];
      expect(message).toMatch(/^SyntaxError: /);
      expect(line).toBe(1);
    });

    it('runs the checks with Ctrl+Shift+Enter, and Ctrl+Enter still runs the code', async () => {
      open('?exercise=two-sum');
      await act(async () => {
        fireEvent.keyDown(window, { key: 'Enter', ctrlKey: true, shiftKey: true });
      });
      await waitFor(() =>
        expect(screen.getByRole('status')).toHaveTextContent('0 of 5 checks passed')
      );
      expect(mocks.execute).not.toHaveBeenCalled();
      await act(async () => {
        fireEvent.keyDown(window, { key: 'Enter', ctrlKey: true });
      });
      expect(mocks.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('a milestone', () => {
    /** A module's milestone that Two Sum counts for, from the real catalog */
    const milestone = milestones().find(
      (item) => item.moduleId !== undefined && item.exerciseIds?.includes('two-sum')
    )!;
    const passed = (ids: string[]): string =>
      JSON.stringify(Object.fromEntries(ids.map((id) => [id, { passed: true }])));
    const line = (): HTMLElement => screen.getByTestId('milestones-reached');

    it('is announced in the Task panel when the pass that earns it is made, and not again', async () => {
      localStorage.setItem(
        PROGRESS_STORAGE_KEY,
        passed(milestone.exerciseIds!.filter((id) => id !== 'two-sum'))
      );
      window.history.replaceState(null, '', '/playground?exercise=two-sum');
      const view = render(<PlaygroundApp />);
      expect(line()).toBeEmptyDOMElement();

      fireEvent.click(screen.getByText('type the solution'));
      expect(await check()).toHaveTextContent('All 5 checks passed.');

      await waitFor(() =>
        expect(line()).toHaveTextContent(`Milestone reached: ${milestone.title}`)
      );
      expect(
        within(line()).getByRole('link', { name: new RegExp(`^${milestone.title}`) })
      ).toHaveAttribute('href', '/progress');
      expect(readStoredProgressRecord()?.milestones[milestone.id]).toBeDefined();

      // Checking again keeps the line as it is
      const shown = line().textContent;
      await check();
      expect(line().textContent).toBe(shown);

      // A reload shows none, and passing again earns none
      view.unmount();
      render(<PlaygroundApp />);
      expect(line()).toBeEmptyDOMElement();
      expect(await check()).toHaveTextContent('All 5 checks passed.');
      expect(line()).toBeEmptyDOMElement();
    });

    it('is not announced for work done before progress was recorded', async () => {
      localStorage.setItem(PROGRESS_STORAGE_KEY, passed(milestone.exerciseIds!));
      open('?exercise=two-sum');
      // Worked out silently on this first visit
      expect(readStoredProgressRecord()?.milestones[milestone.id]).toBeDefined();
      expect(line()).toBeEmptyDOMElement();

      fireEvent.click(screen.getByText('type the solution'));
      expect(await check()).toHaveTextContent('All 5 checks passed.');
      expect(line()).toBeEmptyDOMElement();
    });

    it('links to the progress page from the Exercises menu', () => {
      open('');
      fireEvent.click(screen.getByRole('button', { name: /^Exercises/ }));
      const link = screen.getByRole('link', { name: /^Your progress/ });
      expect(link).toHaveAttribute('href', '/progress');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('watching a check', () => {
    it('runs the learner’s code plus that one call, traced, and loads its steps', async () => {
      const watched = `${twoSum.starterCode}\ntwoSum([3, 2, 4], 6);`;
      const trace = traceSync(watched);
      mocks.execute.mockResolvedValue({ error: null, trace });
      open('?exercise=two-sum&lens=none');
      expect(lens()).toBe('none');

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /^Watch check 2/ }));
      });

      const [code, options] = mocks.execute.mock.calls[0];
      expect(code).toContain('__t.step(');
      expect(code).toMatch(/twoSum[\s\S]*\[3, 2, 4\], 6/);
      expect(options.rateLimit).toBe(false);
      expect(options.traceLimits.maxSteps).toBe(2000);
      // No lens was on, so the exercise's suggested lens is
      expect(lens()).toBe('stack-heap');
      expect(screen.getByTestId('mock-visualization').getAttribute('data-steps')).toBe(
        String(trace.steps.length)
      );
      expect(screen.getByRole('button', { name: /^Watch check 2/ })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
      // The call itself is on a line after the learner's code: nothing is highlighted for it
      const lines = twoSum.starterCode.split('\n').length;
      const line = screen.getByTestId('mock-editor').getAttribute('data-line');
      expect(line === null || Number(line) <= lines).toBe(true);
    });

    it('keeps the lens the learner chose', async () => {
      open('?exercise=two-sum&lens=stack-queues');
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /^Watch check 1/ }));
      });
      expect(lens()).toBe('stack-queues');
    });
  });

  describe('the solution', () => {
    const reveal = (): void => {
      fireEvent.click(screen.getByRole('button', { name: 'Show solution' }));
      fireEvent.click(screen.getByRole('button', { name: 'Show' }));
    };
    const solutionCode = (): string =>
      screen.getByRole('group', { name: 'Solution code, read-only' }).textContent ?? '';

    it('is shown after the question, and that it was seen is remembered', () => {
      open('?exercise=two-sum');
      expect(loadProgress()['two-sum']).toBeUndefined();
      fireEvent.click(screen.getByRole('button', { name: 'Show solution' }));
      expect(loadProgress()['two-sum']).toBeUndefined();
      fireEvent.click(screen.getByRole('button', { name: 'Show' }));

      expect(solutionCode()).toBe(twoSum.solution.code);
      expect(loadProgress()['two-sum']).toEqual({ solutionSeen: true });
      // Showing it changes nothing in the editor
      expect(editorCode()).toBe(twoSum.starterCode);
    });

    it('still works for the visit when storage is unavailable', () => {
      const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      open('?exercise=two-sum');
      reveal();
      expect(solutionCode()).toBe(twoSum.solution.code);
      // Remembered in memory: hidden and shown again, it does not ask twice
      fireEvent.click(screen.getByRole('button', { name: 'Hide solution' }));
      fireEvent.click(screen.getByRole('button', { name: 'Show solution' }));
      expect(solutionCode()).toBe(twoSum.solution.code);
      getItem.mockRestore();
      setItem.mockRestore();
    });

    it('is traced into the lens by Watch it run, and the editor keeps the learner’s code', async () => {
      const first = twoSum.checks.find((item) => !item.hidden)!;
      const trace = traceSync(`${twoSum.solution.code}\ntwoSum([2, 7, 11, 15], 9);`);
      mocks.execute.mockResolvedValue({ error: null, trace });
      open('?exercise=two-sum&lens=none');
      fireEvent.click(screen.getByText('type my own code'));
      reveal();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Watch it run' }));
      });

      const [code, options] = mocks.execute.mock.calls[0];
      // The solution ran, with the first visible check's call, traced
      expect(code).toContain('__t.step(');
      expect(code).toContain('seen.set(');
      expect(code).not.toContain('mine');
      expect(first.args).toEqual([[2, 7, 11, 15], 9]);
      expect(code).toMatch(/twoSum[\s\S]*\[2, 7, 11, 15\], 9/);
      expect(options.rateLimit).toBe(false);
      expect(lens()).toBe('stack-heap');
      expect(Number(screen.getByTestId('mock-visualization').getAttribute('data-steps'))).toBe(
        trace.steps.length
      );
      expect(trace.steps.length).toBeGreaterThan(1);

      // The learner's code is where it was, in the editor and in what is remembered
      expect(editorCode()).toBe('let mine = 1;');
      expect(loadProgress()['two-sum']?.code).toBe('let mine = 1;');
      // The steps are lines of the solution: the editor highlights none, the panel marks one
      expect(screen.getByTestId('mock-editor').getAttribute('data-line')).toBeNull();
      expect(screen.getByRole('button', { name: 'Watch it run' })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
      expect(screen.getByText(/The editor still holds your code\./)).toBeInTheDocument();
      // No check is marked as the watched one
      expect(screen.getByRole('button', { name: /^Watch check 1/ })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
    });

    it('is loaded into the editor only after the question, when the learner has edits', async () => {
      const confirm = vi.spyOn(window, 'confirm');
      open('?exercise=two-sum');
      fireEvent.click(screen.getByText('type my own code'));
      reveal();

      fireEvent.click(screen.getByRole('button', { name: 'Load into the editor' }));
      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveTextContent('Load the solution of “Two Sum” into the editor?');
      expect(confirm).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Keep my code' })).toHaveFocus();
      expect(editorCode()).toBe('let mine = 1;');

      fireEvent.click(screen.getByRole('button', { name: 'Keep my code' }));
      expect(screen.queryByRole('alertdialog')).toBeNull();
      expect(editorCode()).toBe('let mine = 1;');
      expect(loadProgress()['two-sum']?.code).toBe('let mine = 1;');

      fireEvent.click(screen.getByRole('button', { name: 'Load into the editor' }));
      fireEvent.click(screen.getByRole('button', { name: 'Replace my code' }));
      expect(screen.queryByRole('alertdialog')).toBeNull();
      expect(editorCode()).toBe(twoSum.solution.code);
      expect(screen.getByText('The solution is in the editor.')).toBeInTheDocument();
      confirm.mockRestore();

      // It passes, and the pass is marked honestly
      expect(await check()).toHaveTextContent('All 5 checks passed.');
      expect(loadProgress()['two-sum']).toEqual({
        passed: true,
        solutionSeen: true,
        code: twoSum.solution.code,
      });
      expect(screen.getByText('Passed before,')).toBeInTheDocument();
      expect(screen.getByText('solution seen')).toBeInTheDocument();

      // The Exercises menu says the same
      fireEvent.click(screen.getByRole('button', { name: /^Exercises/ }));
      const list = screen.getByRole('region', { name: 'Easy exercises' });
      expect(
        within(list).getByRole('button', { name: /^Two Sum.*Passed.*solution seen/ })
      ).toBeInTheDocument();
    });

    it('is loaded without a question when the editor holds only the starter code', () => {
      open('?exercise=two-sum');
      reveal();
      fireEvent.click(screen.getByRole('button', { name: 'Load into the editor' }));
      expect(screen.queryByRole('alertdialog')).toBeNull();
      expect(editorCode()).toBe(twoSum.solution.code);
    });

    it('is hidden again when another exercise is opened', () => {
      open('?exercise=two-sum');
      reveal();
      fireEvent.click(screen.getByRole('button', { name: /^Exercises/ }));
      fireEvent.click(
        within(screen.getByRole('region', { name: 'Easy exercises' })).getByRole('button', {
          name: /^Valid Parentheses/,
        })
      );
      expect(screen.queryByRole('group', { name: 'Solution code, read-only' })).toBeNull();
      expect(screen.getByRole('button', { name: 'Show solution' })).toBeInTheDocument();
    });
  });

  describe('hints', () => {
    it('are revealed one at a time', () => {
      open('?exercise=two-sum');
      expect(screen.queryByText(twoSum.hints[0])).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: /^Show a hint/ }));
      expect(screen.getByText(twoSum.hints[0])).toBeInTheDocument();
      expect(screen.queryByText(twoSum.hints[1])).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: /^Show the next hint/ }));
      expect(screen.getByText(twoSum.hints[1])).toBeInTheDocument();
    });
  });

  describe('opening and leaving', () => {
    const openFromMenu = (title: string): void => {
      fireEvent.click(screen.getByRole('button', { name: /^Exercises/ }));
      const list = screen.getByRole('region', { name: 'Easy exercises' });
      fireEvent.click(within(list).getByRole('button', { name: new RegExp(`^${title}`) }));
    };

    it('opens from the menu without asking when the editor holds the template, and updates the address', () => {
      open('');
      openFromMenu('Valid Parentheses');
      expect(screen.queryByRole('alertdialog')).toBeNull();
      expect(screen.getByRole('heading', { name: 'Valid Parentheses' })).toBeInTheDocument();
      expect(editorCode()).toContain('function isValid(s)');
      expect(window.location.search).toBe('?exercise=valid-parentheses');
      expect(window.location.pathname).toBe('/playground');
      expect(tab('Task')).toHaveAttribute('aria-selected', 'true');
    });

    it('asks in the page before replacing code the learner wrote in free play', () => {
      const confirm = vi.spyOn(window, 'confirm');
      open('');
      fireEvent.click(screen.getByText('type my own code'));
      openFromMenu('Valid Parentheses');

      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveTextContent('Open the exercise “Valid Parentheses”?');
      expect(confirm).not.toHaveBeenCalled();
      // The safe answer has the focus
      expect(screen.getByRole('button', { name: 'Keep my code' })).toHaveFocus();
      expect(editorCode()).toBe('let mine = 1;');

      fireEvent.click(screen.getByRole('button', { name: 'Keep my code' }));
      expect(screen.queryByRole('alertdialog')).toBeNull();
      expect(editorCode()).toBe('let mine = 1;');
      expect(window.location.search).toBe('');

      openFromMenu('Valid Parentheses');
      fireEvent.click(screen.getByRole('button', { name: 'Replace my code' }));
      expect(screen.queryByRole('alertdialog')).toBeNull();
      expect(editorCode()).toContain('function isValid(s)');
      confirm.mockRestore();
    });

    it('answers the question with the safe answer on Escape', () => {
      open('');
      fireEvent.click(screen.getByText('type my own code'));
      openFromMenu('Two Sum');
      fireEvent.keyDown(screen.getByRole('button', { name: 'Keep my code' }), { key: 'Escape' });
      expect(screen.queryByRole('alertdialog')).toBeNull();
      expect(editorCode()).toBe('let mine = 1;');
    });

    it('moves between exercises without asking, because each keeps its own code', () => {
      open('?exercise=two-sum');
      fireEvent.click(screen.getByText('type the solution'));
      openFromMenu('Valid Parentheses');
      expect(screen.queryByRole('alertdialog')).toBeNull();
      expect(editorCode()).toContain('function isValid(s)');

      openFromMenu('Two Sum');
      expect(editorCode()).toBe(TWO_SUM_SOLUTION);
      expect(window.location.search).toBe('?exercise=two-sum');
    });

    it('leaves to free play: the template, the Console, a clean address', async () => {
      open('?exercise=two-sum');
      fireEvent.click(screen.getByText('type the solution'));
      await check();
      fireEvent.click(screen.getByRole('button', { name: 'Leave exercise' }));

      expect(editorCode()).toBe(getDefaultTemplate('javascript'));
      expect(tab('Console')).toHaveAttribute('aria-selected', 'true');
      expect(window.location.search).toBe('');
      expect(screen.queryByText('Exercise: Two Sum')).toBeNull();

      // The Task tab now lists the exercises, with this one marked as passed
      fireEvent.click(tab('Task'));
      const passed = screen.getByRole('button', { name: /Two Sum.*Passed/ });
      fireEvent.click(passed);
      expect(editorCode()).toBe(TWO_SUM_SOLUTION);
    });

    it('starts over only after asking, and forgets the code it discards', () => {
      open('?exercise=two-sum');
      fireEvent.click(screen.getByText('type the solution'));
      fireEvent.click(screen.getByRole('button', { name: 'Start over' }));
      expect(screen.getByRole('alertdialog')).toHaveTextContent('Start “Two Sum” over?');
      expect(editorCode()).toBe(TWO_SUM_SOLUTION);

      fireEvent.click(screen.getByRole('button', { name: 'Discard my code' }));
      expect(editorCode()).toBe(twoSum.starterCode);
      expect(loadProgress()['two-sum']?.code).toBeUndefined();
    });

    it('leaves the exercise when an example is loaded', () => {
      open('?exercise=two-sum');
      fireEvent.click(screen.getByRole('button', { name: /Examples/ }));
      fireEvent.click(screen.getAllByRole('option')[0]);
      expect(screen.queryByText('Exercise: Two Sum')).toBeNull();
      expect(tab('Console')).toHaveAttribute('aria-selected', 'true');
      expect(window.location.search).toMatch(/^\?example=/);
    });
  });

  describe('the Task and Console tabs', () => {
    it('switch with a click and with the arrow keys, without stepping the trace', () => {
      open('?exercise=two-sum');
      fireEvent.click(tab('Console'));
      expect(tab('Console')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('log', { name: 'Console' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Two Sum' })).toBeNull();

      fireEvent.keyDown(tab('Console'), { key: 'ArrowLeft' });
      expect(tab('Task')).toHaveAttribute('aria-selected', 'true');
      expect(tab('Task')).toHaveFocus();
      expect(screen.getByRole('heading', { name: 'Two Sum' })).toBeInTheDocument();
    });
  });
});
