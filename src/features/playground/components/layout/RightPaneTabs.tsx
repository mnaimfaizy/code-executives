import React, { useRef } from 'react';
import { Trash2 } from 'lucide-react';

export type RightPaneTab = 'task' | 'console';

interface RightPaneTabsProps {
  active: RightPaneTab;
  onChange: (tab: RightPaneTab) => void;
  /** Marks the Task tab while an exercise is open. */
  taskOpen: boolean;
  /** How many errors the Console holds, shown on its tab while the Task tab is in front. */
  consoleErrors: number;
  onClearConsole: () => void;
  task: React.ReactNode;
  console: React.ReactNode;
}

const TABS: Array<{ id: RightPaneTab; label: string }> = [
  { id: 'task', label: 'Task' },
  { id: 'console', label: 'Console' },
];

/**
 * The right pane: the Task of an exercise and the Console, as two tabs, so neither takes
 * room from the lens. Left and Right move between the tabs, as in any tab list.
 */
const RightPaneTabs: React.FC<RightPaneTabsProps> = ({
  active,
  onChange,
  taskOpen,
  consoleErrors,
  onClearConsole,
  task,
  console: consolePanel,
}) => {
  const tabRefs = useRef<Partial<Record<RightPaneTab, HTMLButtonElement | null>>>({});

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    // The page's own arrow keys step through the trace: not while a tab has the focus
    event.stopPropagation();
    const next: RightPaneTab = active === 'task' ? 'console' : 'task';
    onChange(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          height: '32px',
          borderBottom: '1px solid var(--pg-border)',
          background: 'var(--pg-bg-surface)',
        }}
      >
        <div
          role="tablist"
          aria-label="Task and Console"
          className="flex h-full"
          onKeyDown={handleKeyDown}
        >
          {TABS.map((tab) => {
            const selected = tab.id === active;
            return (
              <button
                key={tab.id}
                ref={(element) => {
                  tabRefs.current[tab.id] = element;
                }}
                type="button"
                role="tab"
                id={`pg-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`pg-tabpanel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => onChange(tab.id)}
                className="flex items-center gap-1.5 px-3 h-full text-xs font-medium"
                style={{
                  fontFamily: 'var(--pg-font-mono)',
                  color: selected ? 'var(--pg-text-primary)' : 'var(--pg-text-secondary)',
                  borderBottom: `2px solid ${selected ? 'var(--pg-accent-blue)' : 'transparent'}`,
                  background: selected ? 'var(--pg-bg-primary)' : 'transparent',
                }}
              >
                <span>{tab.label}</span>
                {tab.id === 'task' && taskOpen && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--pg-accent-blue)' }}
                    aria-hidden="true"
                  />
                )}
                {tab.id === 'task' && taskOpen && <span className="sr-only">(exercise open)</span>}
                {tab.id === 'console' && !selected && consoleErrors > 0 && (
                  <span
                    className="px-1 rounded text-[10px]"
                    style={{ background: 'var(--pg-accent-red)', color: 'var(--pg-bg-primary)' }}
                  >
                    {consoleErrors}
                    <span className="sr-only">{consoleErrors === 1 ? ' error' : ' errors'}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {active === 'console' && (
          <button
            type="button"
            onClick={onClearConsole}
            className="p-1 mr-2 rounded hover:bg-white/10"
            style={{ color: 'var(--pg-text-muted)' }}
            aria-label="Clear console"
            title="Clear console (Ctrl+L)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div
        role="tabpanel"
        id="pg-tabpanel-task"
        aria-labelledby="pg-tab-task"
        hidden={active !== 'task'}
        className="flex-1 min-h-0"
      >
        {active === 'task' && task}
      </div>
      <div
        role="tabpanel"
        id="pg-tabpanel-console"
        aria-labelledby="pg-tab-console"
        hidden={active !== 'console'}
        className="flex-1 min-h-0"
      >
        {active === 'console' && consolePanel}
      </div>
    </div>
  );
};

export default RightPaneTabs;
