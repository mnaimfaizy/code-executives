import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import StatsGrid from '../../../../components/shared/StatsGrid';
import TypeNarrowing2D from '../visualizations/2d/TypeNarrowing2D';
import UnionIntersection2D from '../visualizations/2d/UnionIntersection2D';
import TypeScriptCodeBlock from '../shared/TypeScriptCodeBlock';

const TYPE_INFERENCE_CODE = `// TypeScript infers types automatically
let message = "hello";       // inferred as string
let count = 42;              // inferred as number
let active = true;           // inferred as boolean

// Array inference
let numbers = [1, 2, 3];    // number[]
let mixed = [1, "two", 3];  // (string | number)[]

// Function return type inference
function add(a: number, b: number) {
  return a + b;              // inferred return: number
}

// Object inference
let user = {
  name: "Alice",             // { name: string;
  age: 30,                   //   age: number;
  isAdmin: false             //   isAdmin: boolean }
};

// Generic inference
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
const n = first([1, 2, 3]); // T inferred as number
const s = first(["a", "b"]); // T inferred as string`;

const STRUCTURAL_TYPING_CODE = `// TypeScript uses structural typing (duck typing)
interface Point {
  x: number;
  y: number;
}

interface Vector2D {
  x: number;
  y: number;
}

// Works — same structure, different names
const point: Point = { x: 1, y: 2 };
const vector: Vector2D = point; // OK!

// Extra properties are compatible
interface Point3D {
  x: number;
  y: number;
  z: number;
}

const p3d: Point3D = { x: 1, y: 2, z: 3 };
const p2d: Point = p3d; // OK — has x and y

// Missing properties are NOT compatible
// const bad: Point3D = point; // Error: missing 'z'

// This is different from nominal typing in Java/C#
// where class names matter, not just structure`;

const TypeSystem: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'narrowing' | 'union-intersection'>('narrowing');

  const navigateToSection = (sectionName: string): void => {
    const encodedSection = encodeURIComponent(sectionName);
    navigate(`/typescript?section=${encodedSection}`);
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">TypeScript Type System</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Explore TypeScript&apos;s powerful type system — from inference and structural typing to
          narrowing and algebraic types — through interactive visualizations
        </p>
      </div>
      <StatsGrid
        stats={[
          { value: 'Structural', label: 'Duck-typed compatibility' },
          { value: 'Inferred', label: 'Types derived automatically' },
          { value: 'Narrowing', label: 'Control-flow analysis' },
        ]}
        colorScheme="indigo"
      />
    </div>
  );

  const mainContent = (
    <>
      {/* Interactive Visualization Section */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Interactive Type Visualizations</h2>
        <p className="text-gray-600 mb-5">
          Pick a visualization below and interact with it to see TypeScript&apos;s type system in
          action.
        </p>

        {/* Tab selector */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('narrowing')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              activeTab === 'narrowing'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🎯 Type Narrowing
          </button>
          <button
            onClick={() => setActiveTab('union-intersection')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              activeTab === 'union-intersection'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            ⊕ Union &amp; Intersection
          </button>
        </div>

        {activeTab === 'narrowing' && <TypeNarrowing2D />}
        {activeTab === 'union-intersection' && <UnionIntersection2D />}
      </ThemeCard>

      {/* Type Inference */}
      <ThemeCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
            <span className="text-white text-lg">🔮</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Type Inference</h2>
            <p className="text-sm text-gray-500">TypeScript figures out types for you</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <TypeScriptCodeBlock
              code={TYPE_INFERENCE_CODE}
              title="type-inference.ts"
              highlightLines={[2, 3, 4, 7, 8, 12]}
              maxHeight="24rem"
            />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
              <h4 className="font-semibold text-indigo-800 mb-3">How Inference Works</h4>
              <ul className="space-y-2.5 text-sm text-indigo-700">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                    1
                  </span>
                  <span>
                    TypeScript analyzes the <strong>right side</strong> of assignments
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                    2
                  </span>
                  <span>
                    Return types are inferred from <strong>return statements</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                    3
                  </span>
                  <span>
                    Generic type parameters are inferred from <strong>arguments</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                    4
                  </span>
                  <span>
                    Arrays get <strong>union types</strong> for mixed elements
                  </span>
                </li>
              </ul>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="text-sm text-amber-800">
                <strong>💡 Pro tip:</strong> You don&apos;t need to annotate everything. Let
                inference work for local variables and add explicit types at function boundaries and
                public APIs.
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Structural Typing */}
      <ThemeCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
            <span className="text-white text-lg">🦆</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Structural Typing</h2>
            <p className="text-sm text-gray-500">
              &quot;If it looks like a duck, it&apos;s a duck&quot;
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <TypeScriptCodeBlock
              code={STRUCTURAL_TYPING_CODE}
              title="structural-typing.ts"
              highlightLines={[13, 14, 22, 23]}
              maxHeight="24rem"
            />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
              <h4 className="font-semibold text-emerald-800 mb-3">Structural vs Nominal</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">TS</span>
                  <div>
                    <p className="text-sm text-emerald-700 font-semibold">Structural</p>
                    <p className="text-xs text-emerald-600">
                      Types are compatible if their <em>shapes</em> match
                    </p>
                  </div>
                </div>
                <div className="border-t border-emerald-200" />
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 font-bold mt-0.5">Java</span>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Nominal</p>
                    <p className="text-xs text-gray-500">
                      Types must share the same <em>name/declaration</em>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-2 text-sm">Key Rules</h4>
              <ul className="text-xs text-blue-700 space-y-1.5">
                <li>✅ Extra properties are OK (width-wise compatible)</li>
                <li>❌ Missing required properties fail</li>
                <li>✅ Method signatures must be compatible</li>
                <li>🔄 Works for interfaces, types, and classes</li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Type System Topics</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Advanced Types"
            description="Union, intersection, conditional types"
            colorScheme="indigo"
            onClick={() => navigateToSection('Advanced Types')}
          />
          <NavigationCard
            title="Generics"
            description="Type-safe reusable components"
            colorScheme="indigo"
            onClick={() => navigateToSection('Generics')}
          />
          <NavigationCard
            title="Type Guards"
            description="Runtime type checking"
            colorScheme="indigo"
            onClick={() => navigateToSection('Type Guards')}
          />
          <NavigationCard
            title="Visualizations"
            description="OOP concepts animated"
            colorScheme="indigo"
            onClick={() => navigateToSection('TypeScript Visualization')}
          />
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Reference</h3>
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-100">
            <code className="text-xs font-mono text-indigo-700 block">string | number</code>
            <p className="text-xs text-gray-500 mt-1">Union — one of the listed types</p>
          </div>
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-3 border border-pink-100">
            <code className="text-xs font-mono text-pink-700 block">User &amp; Admin</code>
            <p className="text-xs text-gray-500 mt-1">Intersection — satisfies both types</p>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-100">
            <code className="text-xs font-mono text-emerald-700 block">
              typeof x === &quot;string&quot;
            </code>
            <p className="text-xs text-gray-500 mt-1">Type guard — narrows at runtime</p>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-100">
            <code className="text-xs font-mono text-amber-700 block">T extends U ? X : Y</code>
            <p className="text-xs text-gray-500 mt-1">Conditional type — type-level if/else</p>
          </div>
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
        title="Dive into Advanced Types"
        description="Now that you understand the type system foundations, explore union types, mapped types, conditional types and more."
        buttonText="Next: Advanced Types"
        onButtonClick={() => navigateToSection('Advanced Types')}
        colorScheme="indigo"
      />
    </>
  );
};

export default TypeSystem;
