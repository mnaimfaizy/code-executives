import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import StatsGrid from '../../../../components/shared/StatsGrid';

const Generics: React.FC = () => {
  const navigateToSection = (section: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('section', section);
    window.history.pushState({}, '', url.toString());
  };

  // Code examples as string constants
  const basicGenericsCode =
    "// Generic function\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n\n// Usage with different types\nconst num = identity<number>(42);\nconst str = identity<string>('hello');\nconst bool = identity<boolean>(true);\n\n// Type inference (T is inferred)\nconst inferred = identity('world'); // string\n\n// Generic interface\ninterface Container<T> {\n  value: T;\n  getValue(): T;\n  setValue(value: T): void;\n}\n\n// Implementation\nclass StringContainer implements Container<string> {\n  value: string = '';\n\n  getValue(): string {\n    return this.value;\n  }\n\n  setValue(value: string): void {\n    this.value = value;\n  }\n}\n\n// Generic class\nclass Stack<T> {\n  private items: T[] = [];\n\n  push(item: T): void {\n    this.items.push(item);\n  }\n\n  pop(): T | undefined {\n    return this.items.pop();\n  }\n\n  isEmpty(): boolean {\n    return this.items.length === 0;\n  }\n}\n\n// Usage\nconst numberStack = new Stack<number>();\nnumberStack.push(1);\nnumberStack.push(2);\nconsole.log(numberStack.pop()); // 2";

  const genericConstraintsCode =
    "// Generic constraints with extends\ninterface Lengthwise {\n  length: number;\n}\n\nfunction getLength<T extends Lengthwise>(arg: T): number {\n  return arg.length;\n}\n\n// Usage\nconsole.log(getLength('hello')); // 5\nconsole.log(getLength([1, 2, 3])); // 3\nconsole.log(getLength({ length: 10 })); // 10\n// getLength(42); // Error: number has no length property\n\n// Multiple constraints\nfunction merge<T extends object, U extends object>(obj1: T, obj2: U): T & U {\n  return { ...obj1, ...obj2 };\n}\n\nconst result = merge({ name: 'John' }, { age: 30 });\n// result has both name and age properties\n\n// Constructor constraints\nfunction createInstance<T>(Constructor: new () => T): T {\n  return new Constructor();\n}\n\nclass MyClass {\n  message = 'Hello World';\n}\n\nconst instance = createInstance(MyClass);\nconsole.log(instance.message); // 'Hello World'\n\n// Key constraints\nfunction getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}\n\nconst person = { name: 'Alice', age: 25 };\nconst nameValue = getProperty(person, 'name'); // string\nconst ageValue = getProperty(person, 'age'); // number\n// getProperty(person, 'email'); // Error: 'email' not in keyof person";

  const advancedGenericsCode =
    "// Conditional types\ntype IsString<T> = T extends string ? 'yes' : 'no';\n\ntype A = IsString<string>; // 'yes'\ntype B = IsString<number>; // 'no'\n\n// Mapped types\ntype Readonly<T> = {\n  readonly [P in keyof T]: T[P];\n};\n\ntype Optional<T> = {\n  [P in keyof T]?: T[P];\n};\n\ntype Nullable<T> = {\n  [P in keyof T]: T[P] | null;\n};\n\n// Usage\ninterface Person {\n  name: string;\n  age: number;\n}\n\ntype ReadonlyPerson = Readonly<Person>;\n// { readonly name: string; readonly age: number; }\n\ntype OptionalPerson = Optional<Person>;\n// { name?: string; age?: number; }\n\n// Template literal types\ntype EventName<T extends string> = `on${Capitalize<T>}`;\n\ntype ClickEvent = EventName<'click'>; // 'onClick'\ntype ChangeEvent = EventName<'change'>; // 'onChange'\n\n// Utility types from TypeScript\ntype PartialPerson = Partial<Person>; // All properties optional\ntype RequiredPerson = Required<OptionalPerson>; // All properties required\ntype PickPerson = Pick<Person, 'name'>; // Only name property\ntype OmitPerson = Omit<Person, 'age'>; // All except age";

  const genericUtilitiesCode =
    "// Generic utility functions\nfunction arrayToObject<T extends Record<string, any>, K extends keyof T>(\n  array: T[],\n  keySelector: (item: T) => K\n): Record<string, T> {\n  const result: Record<string, T> = {};\n  for (const item of array) {\n    const key = keySelector(item);\n    result[key as string] = item;\n  }\n  return result;\n}\n\n// Usage\nconst users = [\n  { id: '1', name: 'Alice' },\n  { id: '2', name: 'Bob' }\n];\n\nconst userMap = arrayToObject(users, user => user.id);\n// { '1': { id: '1', name: 'Alice' }, '2': { id: '2', name: 'Bob' } }\n\n// Generic async utilities\nfunction delay<T>(ms: number, value: T): Promise<T> {\n  return new Promise(resolve => {\n    setTimeout(() => resolve(value), ms);\n  });\n}\n\nasync function fetchWithTimeout<T>(\n  url: string,\n  timeout: number\n): Promise<T> {\n  const controller = new AbortController();\n  const timeoutId = setTimeout(() => controller.abort(), timeout);\n\n  try {\n    const response = await fetch(url, {\n      signal: controller.signal\n    });\n    clearTimeout(timeoutId);\n    return response.json();\n  } catch (error) {\n    clearTimeout(timeoutId);\n    throw error;\n  }\n}\n\n// Generic data structures\nclass Queue<T> {\n  private items: T[] = [];\n\n  enqueue(item: T): void {\n    this.items.push(item);\n  }\n\n  dequeue(): T | undefined {\n    return this.items.shift();\n  }\n\n  peek(): T | undefined {\n    return this.items[0];\n  }\n\n  isEmpty(): boolean {\n    return this.items.length === 0;\n  }\n\n  size(): number {\n    return this.items.length;\n  }\n}\n\n// Usage\nconst stringQueue = new Queue<string>();\nstringQueue.enqueue('first');\nstringQueue.enqueue('second');\nconsole.log(stringQueue.dequeue()); // 'first'";

  const genericConstraintsAdvancedCode =
    "// Advanced constraints\ninterface HasId {\n  id: string | number;\n}\n\ninterface HasTimestamp {\n  createdAt: Date;\n  updatedAt: Date;\n}\n\n// Multiple inheritance-like constraints\ntype Entity<T = {}> = T & HasId & HasTimestamp;\n\ntype User = Entity<{\n  name: string;\n  email: string;\n}>;\n\n// User has id, createdAt, updatedAt, name, email\n\nconst user: User = {\n  id: '123',\n  createdAt: new Date(),\n  updatedAt: new Date(),\n  name: 'John',\n  email: 'john@example.com'\n};\n\n// Generic factory with constraints\nfunction createEntity<T extends HasId>(\n  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>\n): T {\n  return {\n    ...data,\n    id: Math.random().toString(36).substr(2, 9),\n    createdAt: new Date(),\n    updatedAt: new Date()\n  } as T;\n}\n\nconst newUser = createEntity<User>({\n  name: 'Jane',\n  email: 'jane@example.com'\n});\n\n// Discriminated unions with generics\ntype ApiResponse<T> =\n  | { success: true; data: T }\n  | { success: false; error: string };\n\nfunction handleResponse<T>(response: ApiResponse<T>): T | never {\n  if (response.success) {\n    return response.data;\n  } else {\n    throw new Error(response.error);\n  }\n}\n\nconst successResponse: ApiResponse<string> = {\n  success: true,\n  data: 'Hello World'\n};\n\nconst result = handleResponse(successResponse); // 'Hello World'";

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Generics</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Generics enable writing reusable, type-safe code that works with multiple types while
          maintaining type information.
        </p>
      </div>
      <StatsGrid
        stats={[
          { label: 'Type Safety', value: 'Compile-time type checking' },
          { label: 'Code Reuse', value: 'Write once, use with any type' },
          { label: 'Type Inference', value: 'Automatic type deduction' },
          { label: 'Constraints', value: 'Control generic behavior' },
        ]}
        colorScheme="indigo"
      />
    </div>
  );

  const mainContent = (
    <>
      {/* Basic Generics */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Generics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">
              Generic Functions & Classes
            </h3>
            <pre className="bg-gray-900 text-indigo-400 p-4 rounded-lg text-sm overflow-x-auto">
              {basicGenericsCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-600 mb-3">Generic Constraints</h3>
            <pre className="bg-gray-900 text-purple-400 p-4 rounded-lg text-sm overflow-x-auto">
              {genericConstraintsCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Advanced Generics */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Generics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-3">Conditional & Mapped Types</h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {advancedGenericsCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-3">Generic Utilities</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
              {genericUtilitiesCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Advanced Constraints */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Constraints & Patterns</h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">
              Entity Patterns & Discriminated Unions
            </h3>
            <pre className="bg-gray-900 text-indigo-400 p-4 rounded-lg text-sm overflow-x-auto">
              {genericConstraintsAdvancedCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Benefits and Best Practices */}
      <ThemeCard>
        <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800 mb-4">
            Generics Benefits & Best Practices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-purple-700 mb-3">Benefits</h4>
              <ul className="text-purple-600 text-sm space-y-1">
                <li>
                  • <strong>Type Safety:</strong> Catch errors at compile time
                </li>
                <li>
                  • <strong>Code Reuse:</strong> Write generic algorithms once
                </li>
                <li>
                  • <strong>Performance:</strong> No runtime type casting
                </li>
                <li>
                  • <strong>IntelliSense:</strong> Better IDE support and autocomplete
                </li>
                <li>
                  • <strong>Maintainability:</strong> Changes affect all usages consistently
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-700 mb-3">Best Practices</h4>
              <ul className="text-purple-600 text-sm space-y-1">
                <li>• Use descriptive type parameter names (T, U, V)</li>
                <li>• Add constraints when needed with extends</li>
                <li>• Use keyof for property access constraints</li>
                <li>• Leverage built-in utility types</li>
                <li>• Prefer generic constraints over any</li>
                <li>• Document generic type parameters</li>
                <li>• Use default type parameters when appropriate</li>
                <li>• Keep generic hierarchies shallow</li>
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
        <NavigationCard
          title="Encapsulation"
          description="Data hiding and access control"
          colorScheme="indigo"
          onClick={() => navigateToSection('Encapsulation')}
        />
      </ThemeCard>
      <ThemeCard>
        <NavigationCard
          title="Advanced Types"
          description="Union, intersection, and mapped types"
          colorScheme="indigo"
          onClick={() => navigateToSection('AdvancedTypes')}
        />
      </ThemeCard>
      <ThemeCard>
        <NavigationCard
          title="Type Guards"
          description="Runtime type checking"
          colorScheme="indigo"
          onClick={() => navigateToSection('TypeGuards')}
        />
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
        title="Explore Advanced Types"
        description="Learn about union types, intersection types, and more"
        buttonText="Next: Advanced Types"
        onButtonClick={() => navigateToSection('AdvancedTypes')}
        colorScheme="indigo"
      />
    </>
  );
};

export default Generics;
