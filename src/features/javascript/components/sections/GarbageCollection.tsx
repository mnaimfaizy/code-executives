import React from 'react';
import {
  Trash2,
  Cpu,
  CheckCircle2,
  XCircle,
  RefreshCw,
  LayoutList,
  Lightbulb,
  Layers,
} from 'lucide-react';
import TryInPlaygroundLink from '../../../../shared/components/viz/TryInPlaygroundLink';
import GarbageCollectionStory from './GarbageCollectionStory';

/** The section that holds the Stack ↔ Heap story (a test holds it equal to the sidebar's path). */
const STACK_HEAP_STORY_HREF = '/javascript?section=Memory%20Heap%20%26%20Objects';

const GarbageCollection: React.FC = () => {
  return (
    <section className="mb-4">
      {/* Hero Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">Garbage Collection</h2>
          <p className="text-xs text-gray-500">
            mark & sweep · generational GC · automatic memory reclaim
          </p>
        </div>
      </div>

      {/* Engine Context Introduction */}
      <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-4">
        <h3 className="mb-2 text-sm font-semibold text-red-900 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-red-600" />
          Role in JavaScript Engine
        </h3>
        <p className="mb-3 text-xs text-red-800 leading-relaxed">
          Garbage Collection is the engine's automatic memory management system. It tracks object
          reachability, reclaims unused memory, and prevents memory leaks without manual
          intervention.
        </p>
        <div className="flex flex-wrap items-center gap-1 text-xs font-medium">
          <strong className="text-red-800">Engine Integration:</strong>
          {['Heap Allocation', 'Reachability Analysis', 'Mark & Sweep', 'Memory Compaction'].map(
            (step, i, arr) => (
              <React.Fragment key={step}>
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{step}</span>
                {i < arr.length - 1 && <span className="text-red-400">→</span>}
              </React.Fragment>
            )
          )}
        </div>
      </div>

      {/* Theory Section */}
      <div className="mb-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-gray-900 flex items-center gap-2">
          <LayoutList className="w-4 h-4 text-gray-600" />
          Generational Garbage Collection
        </h3>
        <p className="mb-3 text-sm text-gray-700 leading-relaxed">
          Modern engines use generational GC based on the <em>weak generational hypothesis</em>:
          most objects die young. This allows frequent collection of short-lived objects while
          minimizing collection of long-lived ones.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-red-500" />
              Mark-and-Sweep Phases (old generation)
            </p>
            <ul className="text-xs text-gray-700 space-y-1.5">
              {[
                {
                  phase: 'Mark',
                  desc: 'Follow references from the roots and mark every object reached',
                  icon: <CheckCircle2 className="w-3 h-3 text-blue-500" />,
                },
                {
                  phase: 'Sweep',
                  desc: 'Scan the whole heap and reclaim every unmarked object',
                  icon: <XCircle className="w-3 h-3 text-red-500" />,
                },
                {
                  phase: 'Compact',
                  desc: 'Optionally move live objects together to reduce fragmentation',
                  icon: <Layers className="w-3 h-3 text-purple-500" />,
                },
              ].map(({ phase, desc, icon }) => (
                <li key={phase} className="flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0">{icon}</span>
                  <span>
                    <strong>{phase}:</strong> {desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              GC Roots
            </p>
            <ul className="text-xs text-gray-700 space-y-1.5">
              {[
                'Global variables',
                'Local variables of every function that has not returned yet: its frame on the call stack',
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <span className="mt-0.5 w-3.5 h-3.5 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Key Insight:</strong> An object is eligible for collection only when{' '}
            <em>no reachable root</em> holds a reference to it — circular references alone don't
            prevent collection, because the entire unreachable island is swept together.
          </p>
        </div>
      </div>

      {/* The story: marking spreads from the roots, the sweep reads the marks */}
      <div className="mt-2">
        <GarbageCollectionStory />
        <p className="mt-3 text-sm text-slate-700" data-testid="gc-story-note">
          The story shows mark-and-sweep. New objects are first collected by a different collector,
          which copies the live ones instead of marking and sweeping; both decide what is live by
          the same rule, reachability from the roots. The rule the last sentence of beat 8
          describes, freeing an object only when nothing references it, is called{' '}
          <strong>reference counting</strong>.
        </p>
      </div>

      {/* From this story to the one before it, and to the Playground */}
      <div
        className="mt-4 bg-white rounded-xl border border-gray-200 p-5 space-y-2"
        data-testid="stack-heap-bridge"
      >
        <h3 className="text-base font-semibold text-gray-900">Before and after this story</h3>
        <p className="text-sm text-slate-700">
          <a
            href={STACK_HEAP_STORY_HREF}
            className="font-semibold text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
          >
            See how a heap like this gets built
          </a>
          : the Stack ↔ Heap story in Memory Heap &amp; Objects follows a program as frames are
          pushed and popped and objects are allocated, and ends with a collection that reaches
          nothing. The story above starts where that one stops: here the collector has something to
          mark.
        </p>
        <TryInPlaygroundLink example="garbage-collection-story" lens="stack-heap">
          this story&apos;s program opens there with the Stack &amp; Heap lens chosen. A run in the
          Playground marks objects that nothing can reach, but cannot show them being collected.
          Delete line 11, or keep <code>draft.child</code> in a second variable, and see which
          objects a root can still reach.
        </TryInPlaygroundLink>
      </div>
    </section>
  );
};

export default GarbageCollection;
