import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import StatsGrid from '../../../../components/shared/StatsGrid';
import ClassHierarchy2D from '../visualizations/2d/ClassHierarchy2D';
import InheritanceTree2D from '../visualizations/2d/InheritanceTree2D';
import PolymorphismFlow2D from '../visualizations/2d/PolymorphismFlow2D';
import EncapsulationBox2D from '../visualizations/2d/EncapsulationBox2D';
import type {
  ClassDefinition,
  ClassHierarchy2DHandle,
} from '../visualizations/2d/ClassHierarchy2D';
import type {
  InheritanceNode,
  InheritanceTree2DHandle,
} from '../visualizations/2d/InheritanceTree2D';
import type {
  PolymorphicMethod,
  PolymorphismFlow2DHandle,
} from '../visualizations/2d/PolymorphismFlow2D';
import type {
  EncapsulationClass,
  EncapsulationBox2DHandle,
} from '../visualizations/2d/EncapsulationBox2D';

const TypeScriptVisualization: React.FC = () => {
  const navigate = useNavigate();
  const classHierarchyRef = useRef<ClassHierarchy2DHandle>(null);
  const inheritanceTreeRef = useRef<InheritanceTree2DHandle>(null);
  const polymorphismFlowRef = useRef<PolymorphismFlow2DHandle>(null);
  const encapsulationBoxRef = useRef<EncapsulationBox2DHandle>(null);

  const navigateToSection = (sectionName: string) => {
    const encodedSection = encodeURIComponent(sectionName);
    navigate(`/typescript?section=${encodedSection}`);
  };

  // Sample data for visualizations
  const classHierarchyData: ClassDefinition[] = [
    {
      name: 'Animal',
      members: [
        { name: 'name', type: 'property', visibility: 'protected' },
        { name: 'age', type: 'property', visibility: 'protected' },
        { name: 'speak', type: 'method', visibility: 'public', returnType: 'void' },
        { name: 'move', type: 'method', visibility: 'public', returnType: 'void' },
      ],
    },
    {
      name: 'Mammal',
      extends: 'Animal',
      members: [
        { name: 'furColor', type: 'property', visibility: 'public' },
        { name: 'giveBirth', type: 'method', visibility: 'public', returnType: 'void' },
        { name: 'nurse', type: 'method', visibility: 'protected', returnType: 'void' },
      ],
    },
    {
      name: 'Dog',
      extends: 'Mammal',
      members: [
        { name: 'breed', type: 'property', visibility: 'public' },
        { name: 'bark', type: 'method', visibility: 'public', returnType: 'void' },
        { name: 'fetch', type: 'method', visibility: 'public', returnType: 'void' },
      ],
    },
    {
      name: 'Cat',
      extends: 'Mammal',
      members: [
        { name: 'whiskerLength', type: 'property', visibility: 'private' },
        { name: 'purr', type: 'method', visibility: 'public', returnType: 'void' },
        { name: 'scratch', type: 'method', visibility: 'public', returnType: 'void' },
      ],
    },
  ];

  const inheritanceTreeData: InheritanceNode = {
    name: 'Vehicle',
    level: 0,
    properties: [
      { name: 'make', type: 'string' },
      { name: 'model', type: 'string' },
      { name: 'year', type: 'number' },
    ],
    methods: [
      { name: 'start', signature: '(): void', inherited: false },
      { name: 'stop', signature: '(): void', inherited: false },
    ],
  };

  const polymorphismData: PolymorphicMethod[] = [
    {
      name: 'calculateArea',
      baseClass: 'Shape',
      implementations: [
        {
          className: 'Circle',
          signature: '(radius: number): number',
          body: 'return Math.PI * radius * radius;',
          isOverride: true,
        },
        {
          className: 'Rectangle',
          signature: '(width: number, height: number): number',
          body: 'return width * height;',
          isOverride: true,
        },
        {
          className: 'Triangle',
          signature: '(base: number, height: number): number',
          body: 'return (base * height) / 2;',
          isOverride: true,
        },
      ],
    },
  ];

  const encapsulationData: EncapsulationClass = {
    name: 'BankAccount',
    publicMembers: [
      { name: 'accountNumber', type: 'property', visibility: 'public', value: 'string' },
      {
        name: 'deposit',
        type: 'method',
        visibility: 'public',
        signature: '(amount: number): void',
      },
      {
        name: 'withdraw',
        type: 'method',
        visibility: 'public',
        signature: '(amount: number): boolean',
      },
      { name: 'getBalance', type: 'method', visibility: 'public', signature: '(): number' },
    ],
    privateMembers: [
      { name: 'balance', type: 'property', visibility: 'private', value: 'number' },
      {
        name: 'transactionHistory',
        type: 'property',
        visibility: 'private',
        value: 'Transaction[]',
      },
      {
        name: 'validateAmount',
        type: 'method',
        visibility: 'private',
        signature: '(amount: number): boolean',
      },
    ],
    protectedMembers: [
      { name: 'minimumBalance', type: 'property', visibility: 'protected', value: 'number' },
      {
        name: 'calculateInterest',
        type: 'method',
        visibility: 'protected',
        signature: '(): number',
      },
    ],
  };

  // Hero content
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Interactive OOP Visualizations</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Explore TypeScript&apos;s object-oriented programming concepts through interactive,
          animated visualizations — click, toggle, and animate to see abstract concepts come alive
        </p>
      </div>
      <StatsGrid
        stats={[
          { value: '4', label: 'Interactive visualizations' },
          { value: 'OOP', label: 'Hierarchy, inheritance, polymorphism' },
          { value: 'Controls', label: 'Click, toggle, animate' },
        ]}
        colorScheme="indigo"
      />
    </div>
  );

  // Main content with visualizations
  const mainContent = (
    <>
      {/* Class Hierarchy Visualization */}
      <ThemeCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-lg">
              🏗️
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Class Hierarchy &amp; Inheritance</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => classHierarchyRef.current?.expandClass('Dog')}
              className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors"
            >
              Expand Dog
            </button>
            <button
              onClick={() => classHierarchyRef.current?.reset()}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Click on class boxes to expand/collapse members. Colors:{' '}
          <span className="text-blue-600 font-semibold">public</span> ·{' '}
          <span className="text-red-500 font-semibold">private</span> ·{' '}
          <span className="text-amber-500 font-semibold">protected</span>
        </p>
        <div className="h-96 w-full">
          <ClassHierarchy2D
            ref={classHierarchyRef}
            classes={classHierarchyData}
            width={800}
            height={400}
            showVisibility={true}
          />
        </div>
      </ThemeCard>

      {/* Inheritance Flow Visualization */}
      <ThemeCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-lg">
              🌳
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Inheritance Flow</h2>
          </div>
          <button
            onClick={() => inheritanceTreeRef.current?.animateInheritance()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            ▶ Animate Inheritance
          </button>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Watch properties and methods flow down the hierarchy. Click members to highlight them.
        </p>
        <div className="h-96 w-full">
          <InheritanceTree2D
            ref={inheritanceTreeRef}
            rootClass={inheritanceTreeData}
            width={800}
            height={400}
            animationSpeed={1200}
          />
        </div>
      </ThemeCard>

      {/* Polymorphism Flow Visualization */}
      <ThemeCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-lg">
              🔄
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Polymorphism &amp; Method Overriding
            </h2>
          </div>
          <button
            onClick={() => polymorphismFlowRef.current?.animatePolymorphism()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            ▶ Animate Polymorphism
          </button>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          See how different classes implement the same method signature differently. Click
          implementation nodes to view actual code.
        </p>
        <div className="h-96 w-full">
          <PolymorphismFlow2D
            ref={polymorphismFlowRef}
            methods={polymorphismData}
            width={800}
            height={400}
            animationSpeed={1500}
          />
        </div>
      </ThemeCard>

      {/* Encapsulation Visualization */}
      <ThemeCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center text-lg">
              🔐
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Data Encapsulation</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => encapsulationBoxRef.current?.toggleVisibility('private')}
              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              🔒 Toggle Private
            </button>
            <button
              onClick={() => encapsulationBoxRef.current?.toggleVisibility('protected')}
              className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
            >
              🛡️ Toggle Protected
            </button>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Toggle visibility levels to understand how encapsulation controls member access.
        </p>
        <div className="h-96 w-full">
          <EncapsulationBox2D
            ref={encapsulationBoxRef}
            classData={encapsulationData}
            width={800}
            height={400}
            showProtected={true}
          />
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar content
  const sidebarContent = (
    <>
      {/* Color legend */}
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Color Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-700">
              <code className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">public</code>{' '}
              — accessible everywhere
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-full bg-amber-500" />
            <span className="text-sm text-gray-700">
              <code className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                protected
              </code>{' '}
              — class + subclasses
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-full bg-red-500" />
            <span className="text-sm text-gray-700">
              <code className="text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded">private</code>{' '}
              — class only
            </span>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Visualization Controls</h3>
        <div className="space-y-4">
          {[
            {
              icon: '🏗️',
              title: 'Class Hierarchy',
              tips: ['Click classes to expand', 'Color-coded visibility', 'Inheritance arrows'],
            },
            {
              icon: '🌳',
              title: 'Inheritance Flow',
              tips: [
                'Animate property flow',
                'Click to highlight members',
                'See overridden methods',
              ],
            },
            {
              icon: '🔄',
              title: 'Polymorphism',
              tips: ['Watch method dispatch', 'View implementation code', 'Compare signatures'],
            },
            {
              icon: '🔐',
              title: 'Encapsulation',
              tips: ['Toggle visibility levels', 'See access control', 'Understand data hiding'],
            },
          ].map((viz) => (
            <div key={viz.title} className="text-sm">
              <p className="font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5">
                <span>{viz.icon}</span> {viz.title}
              </p>
              <ul className="text-gray-500 space-y-0.5 text-xs">
                {viz.tips.map((tip) => (
                  <li key={tip}>• {tip}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Learning Objectives</h3>
        <div className="space-y-3">
          <NavigationCard
            title="OOP Fundamentals"
            description="Core OOP principles"
            colorScheme="indigo"
            onClick={() => navigateToSection('OOP Fundamentals')}
          />
          <NavigationCard
            title="SOLID Principles"
            description="Design principles for maintainable code"
            colorScheme="indigo"
            onClick={() => navigateToSection('SOLID Principles')}
          />
          <NavigationCard
            title="Advanced Types"
            description="Complex type system features"
            colorScheme="indigo"
            onClick={() => navigateToSection('Advanced Types')}
          />
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
        title="Continue Learning TypeScript"
        description="Now that you've seen these concepts visualized, dive deeper into TypeScript's type system, advanced features, and best practices for building robust applications."
        buttonText="Explore More"
        onButtonClick={() => navigateToSection('TypeScript Basics')}
        colorScheme="indigo"
      />
    </>
  );
};

export default TypeScriptVisualization;
