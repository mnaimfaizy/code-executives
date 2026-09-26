import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, GitFork, Users } from 'lucide-react';

export interface ScenarioCastTag {
  id: string;
  name: string;
  role: string;
}

/** One scenario in a module's gallery. Three-free: the scenario's section is passed in. */
export interface ScenarioEntry {
  id: string;
  title: string;
  summary: string;
  cast: ScenarioCastTag[];
  /** Section labels, exactly as in `moduleNavigation.ts`. */
  concepts: string[];
  choicePoints: number;
  component: React.ComponentType;
}

interface ScenarioGalleryProps {
  scenarios: ScenarioEntry[];
}

export const SCENARIO_PARAM = 'scenario';

/**
 * A module's Scenarios gallery. `?scenario=<id>` (next to `?section=...`) opens one; an unknown
 * id shows the gallery. Other search params are left intact.
 */
const ScenarioGallery: React.FC<ScenarioGalleryProps> = ({ scenarios }) => {
  const [params, setParams] = useSearchParams();
  const { pathname } = useLocation();
  const openId = params.get(SCENARIO_PARAM);
  const open = scenarios.find((s) => s.id === openId);

  const setScenario = (id: string | null) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (id) next.set(SCENARIO_PARAM, id);
      else next.delete(SCENARIO_PARAM);
      return next;
    });

  if (open) {
    const Scenario = open.component;
    return (
      <section aria-label="Scenario" className="mb-10">
        <button
          type="button"
          onClick={() => setScenario(null)}
          className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          All scenarios
        </button>
        <Scenario />
      </section>
    );
  }

  return (
    <section aria-labelledby="scenarios-heading" className="mb-10">
      <h3 id="scenarios-heading" className="mb-1 text-2xl font-bold text-gray-900">
        Scenarios
      </h3>
      <p className="mb-4 text-sm text-gray-600">
        Follow a whole workflow with a team, step by step, and choose what happens next.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {scenarios.map((s) => (
          <article
            key={s.id}
            data-scenario-card={s.id}
            className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h4 className="mb-2 text-lg font-bold text-slate-900">{s.title}</h4>
            <p className="mb-3 text-sm leading-relaxed text-slate-600">{s.summary}</p>

            <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs">
              <Users className="h-4 w-4 text-slate-400" aria-hidden />
              <span className="sr-only">Cast:</span>
              {s.cast.map((m) => (
                <span
                  key={m.id}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-semibold text-slate-700"
                >
                  {m.name}
                  <span className="ml-1 font-normal text-slate-500">{m.role}</span>
                </span>
              ))}
            </div>

            <div className="mb-4 flex flex-wrap gap-1.5 text-xs">
              <span className="text-slate-500">Concepts:</span>
              {s.concepts.map((label) => (
                <Link
                  key={label}
                  to={{ pathname, search: `?section=${encodeURIComponent(label)}` }}
                  className="rounded bg-orange-50 px-1.5 py-0.5 font-medium text-orange-700 hover:bg-orange-100"
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="mt-auto flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <GitFork className="h-3.5 w-3.5" aria-hidden />
                {s.choicePoints} {s.choicePoints === 1 ? 'choice point' : 'choice points'}
              </span>
              <button
                type="button"
                onClick={() => setScenario(s.id)}
                aria-label={`Open scenario: ${s.title}`}
                className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
              >
                Open
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ScenarioGallery;
