import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import StatsGrid from '../../../../components/shared/StatsGrid';
import GenericsVisualizer2D from '../visualizations/2d/GenericsVisualizer2D';
import TypeScriptCodeBlock from '../shared/TypeScriptCodeBlock';

// ── Code examples ───────────────────────────────────────────────────────────

const PRIMITIVE_TYPES_CODE = `// Primitive types
let name: string = "Alice";
let age: number = 30;
let isActive: boolean = true;

// Arrays
let scores: number[] = [90, 85, 92];
let names: Array<string> = ["Alice", "Bob"];

// Tuple — fixed-length, typed array
let person: [string, number] = ["Alice", 30];

// Enum — named constants
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}
let move: Direction = Direction.Up;

// Special types
let anything: any = "no type checking";  // avoid!
let unknown: unknown = "safe any";       // must narrow
let nothing: void = undefined;           // no return
let impossible: never = (() => {         // unreachable
  throw new Error("never");
})();`;

const INTERFACES_CODE = `// Interfaces define object shapes
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;            // optional property
  readonly createdAt: Date; // cannot be reassigned
}

// Extending interfaces
interface Admin extends User {
  role: "admin" | "superadmin";
  permissions: string[];
}

// Index signatures
interface Dictionary {
  [key: string]: string;
}

// Function types
interface MathOperation {
  (a: number, b: number): number;
}

const add: MathOperation = (a, b) => a + b;
const multiply: MathOperation = (a, b) => a * b;

// Using the interface
function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}

const alice: Admin = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  createdAt: new Date(),
  role: "admin",
  permissions: ["read", "write", "delete"],
};`;

const TYPE_ALIASES_CODE = `// Type aliases — flexible type naming
type ID = string | number;
type Status = "active" | "inactive" | "pending";

// Object types
type Point = {
  x: number;
  y: number;
};

// Function types
type Callback = (data: string) => void;
type AsyncFn<T> = () => Promise<T>;

// Mapped type from union
type StatusMap = {
  [K in Status]: boolean;
};
// { active: boolean; inactive: boolean; pending: boolean }

// Template literal types
type CSSProperty = \`\${"margin" | "padding"}-\${"top" | "right" | "bottom" | "left"}\`;

// Conditional types
type IsString<T> = T extends string ? "yes" : "no";
type A = IsString<string>;  // "yes"
type B = IsString<number>;  // "no"

// Utility types
type PartialUser = Partial<{ name: string; age: number }>;
type RequiredUser = Required<PartialUser>;
type PickedUser = Pick<{ name: string; age: number; email: string }, "name" | "email">;`;

const TypeScriptBasics: React.FC = () => {
  const navigate = useNavigate();
  const [activeExample, setActiveExample] = useState<'primitives' | 'interfaces' | 'aliases'>(
    'primitives'
  );

  const navigateToSection = (sectionName: string): void => {
    const encodedSection = encodeURIComponent(sectionName);
    navigate(`/typescript?section=${encodedSection}`);
  };

  const codeMap = {
    primitives: {
      code: PRIMITIVE_TYPES_CODE,
      title: 'primitives.ts',
      highlights: [2, 3, 4, 7, 8, 11],
    },
    interfaces: {
      code: INTERFACES_CODE,
      title: 'interfaces.ts',
      highlights: [3, 4, 5, 6, 7, 12, 13],
    },
    aliases: {
      code: TYPE_ALIASES_CODE,
      title: 'type-aliases.ts',
      highlights: [2, 3, 8, 9, 22, 23],
    },
  };

  const current = codeMap[activeExample];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">TypeScript Basics</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Learn the fundamental building blocks: types, interfaces, generics, and type aliases
        </p>
      </div>
      <StatsGrid
        stats={[
          { value: '12+', label: 'Built-in primitive types' },
          { value: 'Interfaces', label: 'Shape contracts for objects' },
          { value: 'Generics', label: 'Reusable type-safe code' },
        ]}
        colorScheme="indigo"
      />
    </div>
  );

  const mainContent = (
    <>
      {/* Types, Interfaces, Aliases — tabbed code showcase */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Core Type Constructs</h2>
        <p className="text-gray-600 mb-5">
          Switch between the tabs to explore TypeScript&apos;s fundamental type building blocks.
        </p>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {(
            [
              ['primitives', '📦 Primitive Types'],
              ['interfaces', '📐 Interfaces'],
              ['aliases', '🏷️ Type Aliases'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveExample(key)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                activeExample === key
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <TypeScriptCodeBlock
              code={current.code}
              title={current.title}
              highlightLines={current.highlights}
              maxHeight="26rem"
            />
          </div>
          <div className="lg:col-span-2">
            {activeExample === 'primitives' && (
              <div className="space-y-4">
                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                  <h4 className="font-semibold text-indigo-800 mb-3">Type Categories</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'string', icon: '📝', color: 'bg-indigo-100 text-indigo-700' },
                      { name: 'number', icon: '#️⃣', color: 'bg-emerald-100 text-emerald-700' },
                      { name: 'boolean', icon: '✅', color: 'bg-orange-100 text-orange-700' },
                      { name: 'array', icon: '📚', color: 'bg-blue-100 text-blue-700' },
                      { name: 'tuple', icon: '📌', color: 'bg-purple-100 text-purple-700' },
                      { name: 'enum', icon: '🔢', color: 'bg-pink-100 text-pink-700' },
                      { name: 'any', icon: '⚠️', color: 'bg-red-100 text-red-700' },
                      { name: 'unknown', icon: '🔒', color: 'bg-amber-100 text-amber-700' },
                    ].map((t) => (
                      <div
                        key={t.name}
                        className={`${t.color} rounded-lg px-3 py-2 text-xs font-mono font-semibold flex items-center gap-1.5`}
                      >
                        <span>{t.icon}</span> {t.name}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <p className="text-sm text-red-800">
                    <strong>
                      ⚠️ Avoid <code className="bg-red-100 px-1 rounded">any</code>
                    </strong>{' '}
                    — it disables type checking. Use{' '}
                    <code className="bg-red-100 px-1 rounded">unknown</code> instead and narrow with
                    type guards.
                  </p>
                </div>
              </div>
            )}
            {activeExample === 'interfaces' && (
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                  <h4 className="font-semibold text-purple-800 mb-3">Interface Features</h4>
                  <ul className="space-y-2 text-sm text-purple-700">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">•</span>
                      <span>
                        <strong>Optional props</strong> with{' '}
                        <code className="bg-purple-100 px-1 rounded text-xs">?</code>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">•</span>
                      <span>
                        <strong>Readonly</strong> prevents mutation
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">•</span>
                      <span>
                        <strong>Extends</strong> for inheritance
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">•</span>
                      <span>
                        <strong>Index signatures</strong> for dynamic keys
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">•</span>
                      <span>
                        <strong>Declaration merging</strong> across files
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <p className="text-sm text-green-800">
                    <strong>💡 Tip:</strong> Prefer{' '}
                    <code className="bg-green-100 px-1 rounded">interface</code> for object shapes.
                    Use <code className="bg-green-100 px-1 rounded">type</code> for unions,
                    intersections, and computed types.
                  </p>
                </div>
              </div>
            )}
            {activeExample === 'aliases' && (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <h4 className="font-semibold text-blue-800 mb-3">Type vs Interface</h4>
                  <div className="overflow-hidden rounded-lg border border-blue-200">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-blue-100 text-blue-800">
                          <th className="px-3 py-1.5 text-left">Feature</th>
                          <th className="px-3 py-1.5 text-center">type</th>
                          <th className="px-3 py-1.5 text-center">interface</th>
                        </tr>
                      </thead>
                      <tbody className="text-blue-700">
                        <tr className="border-t border-blue-100">
                          <td className="px-3 py-1.5">Union types</td>
                          <td className="px-3 py-1.5 text-center">✅</td>
                          <td className="px-3 py-1.5 text-center">❌</td>
                        </tr>
                        <tr className="border-t border-blue-100 bg-blue-50/50">
                          <td className="px-3 py-1.5">Declaration merge</td>
                          <td className="px-3 py-1.5 text-center">❌</td>
                          <td className="px-3 py-1.5 text-center">✅</td>
                        </tr>
                        <tr className="border-t border-blue-100">
                          <td className="px-3 py-1.5">Mapped types</td>
                          <td className="px-3 py-1.5 text-center">✅</td>
                          <td className="px-3 py-1.5 text-center">❌</td>
                        </tr>
                        <tr className="border-t border-blue-100 bg-blue-50/50">
                          <td className="px-3 py-1.5">Extends</td>
                          <td className="px-3 py-1.5 text-center">✅</td>
                          <td className="px-3 py-1.5 text-center">✅</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ThemeCard>

      {/* Generics Interactive */}
      <ThemeCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
            <span className="text-white text-lg font-mono font-bold">&lt;T&gt;</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Generics — Interactive</h2>
            <p className="text-sm text-gray-500">See how type parameters flow through code</p>
          </div>
        </div>
        <GenericsVisualizer2D />
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Continue Learning</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Type System"
            description="Inference, narrowing, structural typing"
            colorScheme="indigo"
            onClick={() => navigateToSection('Type System')}
          />
          <NavigationCard
            title="OOP Fundamentals"
            description="Classes, inheritance, polymorphism"
            colorScheme="indigo"
            onClick={() => navigateToSection('OOP Fundamentals')}
          />
          <NavigationCard
            title="Advanced Types"
            description="Conditional, mapped, template literal"
            colorScheme="indigo"
            onClick={() => navigateToSection('Advanced Types')}
          />
          <NavigationCard
            title="Generics Deep Dive"
            description="Constraints, utilities, patterns"
            colorScheme="indigo"
            onClick={() => navigateToSection('Generics')}
          />
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Cheat Sheet</h3>
        <div className="space-y-2">
          {[
            { label: 'string', desc: 'Text values' },
            { label: 'number', desc: 'Integers & floats' },
            { label: 'boolean', desc: 'true / false' },
            { label: 'T[]', desc: 'Array of T' },
            { label: '[T, U]', desc: 'Tuple (fixed)' },
            { label: 'Record<K,V>', desc: 'Object map' },
            { label: 'Partial<T>', desc: 'All props optional' },
            { label: 'Required<T>', desc: 'All props required' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-xs"
            >
              <code className="font-mono font-semibold text-indigo-700">{item.label}</code>
              <span className="text-gray-500">{item.desc}</span>
            </div>
          ))}
        </div>
      </ThemeCard>
    </>
  );

  return (
    <>
      <SectionLayout
        section="typescript"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Explore the Type System"
        description="Learn how TypeScript infers types, narrows unions, and uses structural compatibility."
        buttonText="Next: Type System"
        onButtonClick={() => navigateToSection('Type System')}
        colorScheme="indigo"
      />
    </>
  );
};

export default TypeScriptBasics;
