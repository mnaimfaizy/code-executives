import React, { useState, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Legacy type exports (kept for backward compatibility)             */
/* ------------------------------------------------------------------ */
export interface ClassMember {
  name: string;
  type: 'property' | 'method';
  visibility: 'public' | 'private' | 'protected';
  returnType?: string;
  parameters?: Array<{ name: string; type: string }>;
}

export interface ClassDefinition {
  name: string;
  extends?: string;
  members: ClassMember[];
  isAbstract?: boolean;
}

export type ClassHierarchy2DProps = Record<string, never>;
export interface ClassHierarchy2DHandle {
  expandClass(className: string): void;
  collapseClass(className: string): void;
  highlightMember(className: string, memberName: string): void;
  reset(): void;
}

/* ------------------------------------------------------------------ */
/*  Built-in data                                                     */
/* ------------------------------------------------------------------ */
interface Member {
  name: string;
  kind: 'property' | 'method';
  vis: 'public' | 'protected' | 'private';
  sig?: string; // return type or full signature
}

interface ClassNode {
  name: string;
  isAbstract?: boolean;
  members: Member[];
  children?: ClassNode[];
}

interface Example {
  label: string;
  root: ClassNode;
}

const EXAMPLES: Example[] = [
  {
    label: 'Animal Kingdom',
    root: {
      name: 'Animal',
      isAbstract: true,
      members: [
        { name: 'name', kind: 'property', vis: 'protected', sig: 'string' },
        { name: 'age', kind: 'property', vis: 'protected', sig: 'number' },
        { name: 'speak', kind: 'method', vis: 'public', sig: '(): void' },
        { name: 'move', kind: 'method', vis: 'public', sig: '(): void' },
      ],
      children: [
        {
          name: 'Mammal',
          members: [
            { name: 'furColor', kind: 'property', vis: 'public', sig: 'string' },
            { name: 'nurse', kind: 'method', vis: 'protected', sig: '(): void' },
          ],
          children: [
            {
              name: 'Dog',
              members: [
                { name: 'breed', kind: 'property', vis: 'public', sig: 'string' },
                { name: 'bark', kind: 'method', vis: 'public', sig: '(): void' },
                { name: 'fetch', kind: 'method', vis: 'public', sig: '(): void' },
              ],
            },
            {
              name: 'Cat',
              members: [
                { name: 'whiskerLength', kind: 'property', vis: 'private', sig: 'number' },
                { name: 'purr', kind: 'method', vis: 'public', sig: '(): void' },
                { name: 'scratch', kind: 'method', vis: 'public', sig: '(): void' },
              ],
            },
          ],
        },
        {
          name: 'Bird',
          members: [
            { name: 'wingspan', kind: 'property', vis: 'public', sig: 'number' },
            { name: 'fly', kind: 'method', vis: 'public', sig: '(): void' },
          ],
          children: [
            {
              name: 'Eagle',
              members: [
                { name: 'altitude', kind: 'property', vis: 'private', sig: 'number' },
                { name: 'hunt', kind: 'method', vis: 'public', sig: '(): Prey' },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    label: 'UI Components',
    root: {
      name: 'Component',
      isAbstract: true,
      members: [
        { name: 'id', kind: 'property', vis: 'public', sig: 'string' },
        { name: 'render', kind: 'method', vis: 'public', sig: '(): JSX.Element' },
        { name: 'setState', kind: 'method', vis: 'protected', sig: '(s: State): void' },
      ],
      children: [
        {
          name: 'Button',
          members: [
            { name: 'label', kind: 'property', vis: 'public', sig: 'string' },
            { name: 'disabled', kind: 'property', vis: 'public', sig: 'boolean' },
            { name: 'onClick', kind: 'method', vis: 'public', sig: '(): void' },
          ],
        },
        {
          name: 'Input',
          members: [
            { name: 'value', kind: 'property', vis: 'public', sig: 'string' },
            { name: 'validate', kind: 'method', vis: 'private', sig: '(): boolean' },
            { name: 'onChange', kind: 'method', vis: 'public', sig: '(v: string): void' },
          ],
          children: [
            {
              name: 'TextArea',
              members: [
                { name: 'rows', kind: 'property', vis: 'public', sig: 'number' },
                { name: 'autoResize', kind: 'method', vis: 'private', sig: '(): void' },
              ],
            },
            {
              name: 'Select',
              members: [
                { name: 'options', kind: 'property', vis: 'public', sig: 'Option[]' },
                { name: 'onSelect', kind: 'method', vis: 'public', sig: '(o: Option): void' },
              ],
            },
          ],
        },
        {
          name: 'Modal',
          members: [
            { name: 'isOpen', kind: 'property', vis: 'public', sig: 'boolean' },
            { name: 'close', kind: 'method', vis: 'public', sig: '(): void' },
            { name: 'backdrop', kind: 'property', vis: 'private', sig: 'HTMLElement' },
          ],
        },
      ],
    },
  },
  {
    label: 'Vehicle Types',
    root: {
      name: 'Vehicle',
      isAbstract: true,
      members: [
        { name: 'make', kind: 'property', vis: 'public', sig: 'string' },
        { name: 'year', kind: 'property', vis: 'public', sig: 'number' },
        { name: 'start', kind: 'method', vis: 'public', sig: '(): void' },
        { name: 'fuelLevel', kind: 'property', vis: 'protected', sig: 'number' },
      ],
      children: [
        {
          name: 'Car',
          members: [
            { name: 'doors', kind: 'property', vis: 'public', sig: 'number' },
            { name: 'drive', kind: 'method', vis: 'public', sig: '(km: number): void' },
            { name: 'odometer', kind: 'property', vis: 'private', sig: 'number' },
          ],
          children: [
            {
              name: 'ElectricCar',
              members: [
                { name: 'battery', kind: 'property', vis: 'private', sig: 'number' },
                { name: 'charge', kind: 'method', vis: 'public', sig: '(): void' },
              ],
            },
          ],
        },
        {
          name: 'Truck',
          members: [
            { name: 'payload', kind: 'property', vis: 'public', sig: 'number' },
            { name: 'haul', kind: 'method', vis: 'public', sig: '(cargo: Cargo): void' },
          ],
        },
        {
          name: 'Motorcycle',
          members: [
            { name: 'engineCC', kind: 'property', vis: 'public', sig: 'number' },
            { name: 'wheelie', kind: 'method', vis: 'public', sig: '(): void' },
          ],
        },
      ],
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Visibility meta                                                   */
/* ------------------------------------------------------------------ */
type Vis = 'public' | 'protected' | 'private';
const VIS: Record<Vis, { dot: string; label: string }> = {
  public: { dot: 'bg-blue-500', label: 'public' },
  protected: { dot: 'bg-amber-500', label: 'protected' },
  private: { dot: 'bg-red-500', label: 'private' },
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
const ClassHierarchy2D: React.FC = () => {
  const [exIdx, setExIdx] = useState(0);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<{ cls: string; member: Member } | null>(null);

  const ex = EXAMPLES[exIdx];

  const toggleExpand = useCallback((name: string) => {
    setExpanded((prev) => {
      const s = new Set(prev);
      if (s.has(name)) {
        s.delete(name);
      } else {
        s.add(name);
      }
      return s;
    });
    setSelected(null);
  }, []);

  const expandAll = useCallback(() => {
    const names: string[] = [];
    const walk = (n: ClassNode) => {
      names.push(n.name);
      n.children?.forEach(walk);
    };
    walk(ex.root);
    setExpanded(new Set(names));
  }, [ex]);

  const collapseAll = useCallback(() => {
    setExpanded(new Set());
    setSelected(null);
  }, []);

  const selectExample = useCallback((i: number) => {
    setExIdx(i);
    setExpanded(new Set());
    setSelected(null);
  }, []);

  /* ---- Render a single class node (recursion) ---- */
  const renderNode = (node: ClassNode, depth: number): React.ReactNode => {
    const isOpen = expanded.has(node.name);
    const hasChildren = node.children && node.children.length > 0;
    const borderColor =
      depth === 0 ? 'border-indigo-300' : depth === 1 ? 'border-blue-200' : 'border-gray-200';
    const headerBg = depth === 0 ? 'bg-indigo-600' : depth === 1 ? 'bg-blue-500' : 'bg-gray-700';

    return (
      <div key={node.name} className="flex flex-col items-center">
        {/* Class card */}
        <div
          className={`rounded-xl border-2 ${borderColor} bg-white shadow-sm overflow-hidden w-48 sm:w-56 transition-all`}
        >
          {/* Header */}
          <button
            onClick={() => toggleExpand(node.name)}
            className={`w-full flex items-center justify-between px-3 py-2 ${headerBg} text-white text-sm font-bold focus:outline-none`}
          >
            <span className="truncate">
              {node.isAbstract ? '«abstract» ' : ''}
              {node.name}
            </span>
            <span className="ml-1 text-xs opacity-70">{isOpen ? '▼' : '▶'}</span>
          </button>

          {/* Members */}
          {isOpen && (
            <ul className="px-2 py-1.5 space-y-1 max-h-44 overflow-y-auto">
              {node.members.map((m) => {
                const isSel = selected?.cls === node.name && selected?.member.name === m.name;
                return (
                  <li key={m.name}>
                    <button
                      onClick={() => setSelected(isSel ? null : { cls: node.name, member: m })}
                      className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors text-left ${
                        isSel ? 'bg-indigo-50 ring-1 ring-indigo-300' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${VIS[m.vis].dot}`} />
                      <span className="font-mono font-semibold text-gray-800 truncate">
                        {m.name}
                      </span>
                      <span className="text-gray-400 truncate ml-auto">
                        {m.kind === 'property' ? `: ${m.sig ?? ''}` : (m.sig ?? '')}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Collapsed member count */}
          {!isOpen && (
            <div className="px-3 py-1.5 text-xs text-gray-400 text-center">
              {node.members.length} member{node.members.length !== 1 ? 's' : ''} • click to expand
            </div>
          )}
        </div>

        {/* Children with arrows */}
        {hasChildren && (
          <>
            {/* Vertical connector */}
            <div className="w-px h-5 bg-indigo-300" />

            {/* Horizontal bar + children row */}
            <div className="relative flex items-start">
              {/* Horizontal bar spanning children */}
              {node.children!.length > 1 && (
                <div
                  className="absolute top-0 h-px bg-indigo-300"
                  style={{
                    left: '50%',
                    width: `calc(100% - ${100 / node.children!.length}%)`,
                    transform: 'translateX(-50%)',
                  }}
                />
              )}
              <div className="flex gap-3 sm:gap-5">
                {node.children!.map((child) => (
                  <div key={child.name} className="flex flex-col items-center">
                    {/* Vertical stub from horizontal bar to child */}
                    <div className="w-px h-5 bg-indigo-300" />
                    <span className="text-[10px] text-indigo-400 font-semibold -mt-1 mb-1">
                      extends
                    </span>
                    {renderNode(child, depth + 1)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            🏗️ Class Hierarchy
          </h3>
          <p className="text-indigo-200 text-sm mt-0.5">
            Click classes to expand/collapse members • Click members for details
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {EXAMPLES.map((e, i) => (
            <button
              key={e.label}
              onClick={() => selectExample(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                i === exIdx
                  ? 'bg-white text-indigo-700 shadow'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 px-5 pt-4">
        <button
          onClick={expandAll}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
        >
          Expand All
        </button>
        <button
          onClick={collapseAll}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          Collapse All
        </button>
        {/* Legend */}
        <div className="ml-auto flex gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> public
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> protected
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> private
          </span>
        </div>
      </div>

      {/* Tree */}
      <div className="px-5 py-5 overflow-x-auto">
        <div className="flex justify-center min-w-fit">{renderNode(ex.root, 0)}</div>
      </div>

      {/* Selected member detail */}
      {selected && (
        <div className="mx-5 mb-5 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-indigo-700 text-sm">{selected.cls}</span>
            <span className="text-gray-400 text-xs">→</span>
            <span className="font-mono font-bold text-gray-900 text-sm">
              {selected.member.name}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${VIS[selected.member.vis].dot}`}
            >
              {VIS[selected.member.vis].label}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selected.member.kind === 'method'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-violet-100 text-violet-700'
              }`}
            >
              {selected.member.kind}
            </span>
          </div>
          {selected.member.sig && (
            <p className="text-gray-600 text-xs font-mono">
              {selected.member.kind === 'property'
                ? `Type: ${selected.member.sig}`
                : selected.member.sig}
            </p>
          )}
          <p className="text-gray-400 text-xs mt-1">
            {selected.member.vis === 'public' && 'Accessible from anywhere outside the class.'}
            {selected.member.vis === 'protected' &&
              'Only accessible within the class and its subclasses.'}
            {selected.member.vis === 'private' &&
              'Only accessible within this class — hidden from the outside.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(ClassHierarchy2D);
