import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import StatsGrid from '../../components/shared/StatsGrid';

const AdvancedTypes: React.FC = () => {
  const navigateToSection = (section: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('section', section);
    window.history.pushState({}, '', url.toString());
  };

  // Code examples as string constants
  const unionTypesCode =
    "// Union types: value can be one of several types\ntype StringOrNumber = string | number;\ntype Status = 'success' | 'error' | 'loading';\n\ntype User = {\n  id: number;\n  name: string;\n};\n\ntype Admin = {\n  id: number;\n  name: string;\n  permissions: string[];\n};\n\ntype Person = User | Admin;\n\nfunction printId(person: Person): void {\n  console.log(person.id); // OK - both have id\n  // console.log(person.name); // Error - name might not exist\n}\n\nfunction isAdmin(person: Person): person is Admin {\n  return 'permissions' in person;\n}\n\nfunction handlePerson(person: Person): void {\n  if (isAdmin(person)) {\n    console.log(person.permissions); // OK - type narrowed\n  } else {\n    console.log(person.name); // OK - must be User\n  }\n}\n\n// Discriminated unions\ntype Circle = {\n  kind: 'circle';\n  radius: number;\n};\n\ntype Square = {\n  kind: 'square';\n  sideLength: number;\n};\n\ntype Shape = Circle | Square;\n\nfunction getArea(shape: Shape): number {\n  switch (shape.kind) {\n    case 'circle':\n      return Math.PI * shape.radius ** 2;\n    case 'square':\n      return shape.sideLength ** 2;\n  }\n}\n\nconst circle: Circle = { kind: 'circle', radius: 5 };\nconst square: Square = { kind: 'square', sideLength: 10 };\nconsole.log(getArea(circle)); // 78.54...\nconsole.log(getArea(square)); // 100";

  const intersectionTypesCode =
    "// Intersection types: combine multiple types\ntype Name = {\n  name: string;\n};\n\ntype Age = {\n  age: number;\n};\n\ntype Email = {\n  email: string;\n};\n\ntype Person = Name & Age & Email;\n// Equivalent to: { name: string; age: number; email: string; }\n\nconst person: Person = {\n  name: 'John',\n  age: 30,\n  email: 'john@example.com'\n};\n\n// Intersection with classes\nclass Serializable {\n  toJSON(): string {\n    return JSON.stringify(this);\n  }\n}\n\nclass Loggable {\n  log(): void {\n    console.log(this.toString());\n  }\n}\n\ntype SerializableLoggable = Serializable & Loggable;\n\nclass Data implements SerializableLoggable {\n  constructor(public data: any) {}\n\n  toJSON(): string {\n    return JSON.stringify(this.data);\n  }\n\n  toString(): string {\n    return `Data: ${this.data}`;\n  }\n}\n\n// Mixins pattern\nfunction applyMixins(derivedCtor: any, baseCtors: any[]): void {\n  baseCtors.forEach(baseCtor => {\n    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {\n      derivedCtor.prototype[name] = baseCtor.prototype[name];\n    });\n  });\n}\n\nclass SmartObject implements Serializable, Loggable {\n  constructor() {}\n  toJSON(): string { return '{}'; }\n  log(): void { console.log('SmartObject logged'); }\n}\n\napplyMixins(SmartObject, [Serializable, Loggable]);\n\nconst smart = new SmartObject();\nsmart.log(); // 'SmartObject logged'";

  const conditionalTypesCode =
    "// Conditional types: T extends U ? X : Y\ntype IsString<T> = T extends string ? 'yes' : 'no';\n\ntype A = IsString<string>; // 'yes'\ntype B = IsString<number>; // 'no'\n\n// Extract utility type\ntype Extract<T, U> = T extends U ? T : never;\n\ntype StringsOnly = Extract<'a' | 'b' | 1 | 2, string>; // 'a' | 'b'\ntype NumbersOnly = Extract<'a' | 'b' | 1 | 2, number>; // 1 | 2\n\n// NonNullable utility type\ntype NonNullable<T> = T extends null | undefined ? never : T;\n\ntype Example = NonNullable<string | number | null | undefined>; // string | number\n\n// Function overloads with conditionals\ndeclare function createElement<T extends keyof HTMLElementTagNameMap>(\n  tag: T\n): HTMLElementTagNameMap[T];\ndeclare function createElement<T extends keyof HTMLElementTagNameMap>(\n  tag: T,\n  options: { children?: (HTMLElement | string)[] }\n): HTMLElementTagNameMap[T];\n\n// Infer keyword\ntype ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;\n\nfunction add(a: number, b: number): number {\n  return a + b;\n}\n\ntype AddReturnType = ReturnType<typeof add>; // number\n\n// Nested conditionals\ntype DeepFlatten<T> = T extends (infer U)[]\n  ? DeepFlatten<U>\n  : T extends object\n    ? { [K in keyof T]: DeepFlatten<T[K]> }\n    : T;\n\ntype Nested = [1, [2, [3]]];\ntype Flattened = DeepFlatten<Nested>; // number (all levels flattened)";

  const mappedTypesCode =
    "// Mapped types: transform properties of existing types\ntype Readonly<T> = {\n  readonly [P in keyof T]: T[P];\n};\n\ninterface Person {\n  name: string;\n  age: number;\n}\n\ntype ReadonlyPerson = Readonly<Person>;\n// { readonly name: string; readonly age: number; }\n\nconst person: ReadonlyPerson = { name: 'John', age: 30 };\n// person.age = 31; // Error - readonly\n\n// Optional mapped type\ntype Optional<T> = {\n  [P in keyof T]?: T[P];\n};\n\ntype PartialPerson = Optional<Person>;\n// { name?: string; age?: number; }\n\nconst partial: PartialPerson = { name: 'John' }; // age is optional\n\n// Mapped type with template literals\ntype EventHandlers<T> = {\n  [K in keyof T as `on${Capitalize<string & K>}Change`]?: (value: T[K]) => void;\n};\n\ninterface FormData {\n  name: string;\n  email: string;\n  age: number;\n}\n\ntype FormHandlers = EventHandlers<FormData>;\n// {\n//   onNameChange?: (value: string) => void;\n//   onEmailChange?: (value: string) => void;\n//   onAgeChange?: (value: number) => void;\n// }\n\n// Remove readonly modifier\ntype Mutable<T> = {\n  -readonly [P in keyof T]: T[P];\n};\n\ntype MutablePerson = Mutable<ReadonlyPerson>;\n// { name: string; age: number; } - readonly removed\n\n// Add readonly modifier\ntype Immutable<T> = {\n  +readonly [P in keyof T]: T[P];\n};\n\n// Filter out properties\ntype NonFunctionPropertyNames<T> = {\n  [K in keyof T]: T[K] extends Function ? never : K;\n}[keyof T];\n\ntype NonFunctionProps<T> = Pick<T, NonFunctionPropertyNames<T>>;";

  const templateLiteralTypesCode =
    "// Template literal types\ntype World = 'world';\ntype Greeting = `hello ${World}`; // 'hello world'\n\ntype VerticalAlignment = 'top' | 'middle' | 'bottom';\ntype HorizontalAlignment = 'left' | 'center' | 'right';\n\ntype Alignment = `${VerticalAlignment}-${HorizontalAlignment}`;\n// 'top-left' | 'top-center' | 'top-right' |\n// 'middle-left' | 'middle-center' | 'middle-right' |\n// 'bottom-left' | 'bottom-center' | 'bottom-right'\n\nfunction setAlignment(element: HTMLElement, alignment: Alignment): void {\n  // Implementation\n}\n\n// CSS class generation\ntype Size = 'small' | 'medium' | 'large';\ntype Color = 'primary' | 'secondary' | 'danger';\n\ntype ButtonClass = `btn-${Size}-${Color}`;\n// 'btn-small-primary' | 'btn-small-secondary' | 'btn-small-danger' |\n// 'btn-medium-primary' | etc.\n\nfunction createButton(size: Size, color: Color): ButtonClass {\n  return `btn-${size}-${color}`;\n}\n\n// Event names\ntype EventName<T extends string> = `on${Capitalize<T>}`;\n\ntype ClickEvent = EventName<'click'>; // 'onClick'\ntype MouseEvent = EventName<'mouse'>; // 'onMouse'\n\n// File extensions\ntype ImageExtension = 'jpg' | 'png' | 'gif' | 'webp';\ntype VideoExtension = 'mp4' | 'avi' | 'mov';\n\ntype MediaFile<T extends string> = `${T}.${ImageExtension | VideoExtension}`;\n\ntype ImageFile = MediaFile<'photo'>; // 'photo.jpg' | 'photo.png' | etc.\n\n// API endpoints\ntype HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';\ntype ApiEndpoint = `/${string}`;\n\ntype HttpRequest = `${HttpMethod} ${ApiEndpoint}`;\n// 'GET /users' | 'POST /users' | 'PUT /users/123' | etc.\n\nfunction makeRequest(request: HttpRequest): void {\n  const [method, endpoint] = request.split(' ') as [HttpMethod, ApiEndpoint];\n  // Implementation\n}\n\nmakeRequest('GET /users');\nmakeRequest('POST /users');\n// makeRequest('PATCH /users'); // Error - PATCH not in HttpMethod";

  const advancedPatternsCode =
    "// Utility types from TypeScript\ntype Partial<T> = {\n  [P in keyof T]?: T[P];\n};\n\ntype Required<T> = {\n  [P in keyof T]-?: T[P];\n};\n\ntype Readonly<T> = {\n  readonly [P in keyof T]: T[P];\n};\n\ntype Pick<T, K extends keyof T> = {\n  [P in K]: T[P];\n};\n\ntype Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;\n\ntype Record<K extends keyof any, T> = {\n  [P in K]: T;\n};\n\ntype Exclude<T, U> = T extends U ? never : T;\n\ntype Extract<T, U> = T extends U ? T : never;\n\ntype NonNullable<T> = T extends null | undefined ? never : T;\n\ntype Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;\ntype ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;\n\ntype ConstructorParameters<T extends new (...args: any) => any> = T extends new (...args: infer P) => any ? P : never;\ntype InstanceType<T extends new (...args: any) => any> = T extends new (...args: infer R) => any ? R : any;\n\n// Usage examples\ninterface User {\n  id: number;\n  name: string;\n  email: string;\n  createdAt: Date;\n}\n\ntype UserUpdate = Partial<Pick<User, 'name' | 'email'>>;\n// { name?: string; email?: string; }\n\ntype UserResponse = Omit<User, 'createdAt'>;\n// { id: number; name: string; email: string; }\n\ntype UserMap = Record<string, User>;\n// { [key: string]: User; }\n\nfunction createUser(data: UserUpdate): User {\n  return {\n    id: Math.random(),\n    name: data.name || 'Unknown',\n    email: data.email || '',\n    createdAt: new Date()\n  };\n}";

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Advanced Types</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Advanced TypeScript types enable sophisticated type manipulation, creating flexible and
          type-safe code patterns.
        </p>
      </div>
      <StatsGrid
        stats={[
          { label: 'Union Types', value: 'Multiple type options' },
          { label: 'Intersection Types', value: 'Combine multiple types' },
          { label: 'Conditional Types', value: 'Type-level conditionals' },
          { label: 'Mapped Types', value: 'Transform type properties' },
        ]}
        colorScheme="indigo"
      />
    </div>
  );

  const mainContent = (
    <>
      {/* Union and Intersection Types */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Union & Intersection Types</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">
              Union Types & Discriminated Unions
            </h3>
            <pre className="bg-gray-900 text-indigo-400 p-4 rounded-lg text-sm overflow-x-auto">
              {unionTypesCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-600 mb-3">
              Intersection Types & Mixins
            </h3>
            <pre className="bg-gray-900 text-purple-400 p-4 rounded-lg text-sm overflow-x-auto">
              {intersectionTypesCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Conditional and Mapped Types */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Conditional & Mapped Types</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-3">Conditional Types</h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {conditionalTypesCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-3">Mapped Types</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
              {mappedTypesCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Template Literal Types */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Template Literal Types</h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">
              String Manipulation at Type Level
            </h3>
            <pre className="bg-gray-900 text-indigo-400 p-4 rounded-lg text-sm overflow-x-auto">
              {templateLiteralTypesCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Advanced Patterns */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Built-in Utility Types</h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-purple-600 mb-3">TypeScript Utility Types</h3>
            <pre className="bg-gray-900 text-purple-400 p-4 rounded-lg text-sm overflow-x-auto">
              {advancedPatternsCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Benefits and Best Practices */}
      <ThemeCard>
        <div className="p-6 bg-indigo-50 rounded-lg border border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-800 mb-4">
            Advanced Types Benefits & Best Practices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-indigo-700 mb-3">Benefits</h4>
              <ul className="text-indigo-600 text-sm space-y-1">
                <li>
                  • <strong>Type Safety:</strong> Complex type relationships
                </li>
                <li>
                  • <strong>Code Reuse:</strong> Generic type transformations
                </li>
                <li>
                  • <strong>API Design:</strong> Precise type contracts
                </li>
                <li>
                  • <strong>Developer Experience:</strong> Better IntelliSense
                </li>
                <li>
                  • <strong>Maintainability:</strong> Type-level refactoring
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-700 mb-3">Best Practices</h4>
              <ul className="text-indigo-600 text-sm space-y-1">
                <li>• Use discriminated unions for type safety</li>
                <li>• Prefer intersection types over merged interfaces</li>
                <li>• Leverage built-in utility types</li>
                <li>• Use conditional types for complex logic</li>
                <li>• Keep mapped types simple and focused</li>
                <li>• Document complex type patterns</li>
                <li>• Use template literals for string types</li>
                <li>• Test advanced types with unit tests</li>
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
          title="Generics"
          description="Type-safe reusable components"
          colorScheme="indigo"
          onClick={() => navigateToSection('Generics')}
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
      <ThemeCard>
        <NavigationCard
          title="Best Practices"
          description="TypeScript development guidelines"
          colorScheme="indigo"
          onClick={() => navigateToSection('BestPractices')}
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
        title="Explore Type Guards"
        description="Learn about runtime type checking techniques"
        buttonText="Next: Type Guards"
        onButtonClick={() => navigateToSection('TypeGuards')}
        colorScheme="indigo"
      />
    </>
  );
};

export default AdvancedTypes;
