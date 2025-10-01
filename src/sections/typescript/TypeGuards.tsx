import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import StatsGrid from '../../components/shared/StatsGrid';

const TypeGuards: React.FC = () => {
  const navigateToSection = (section: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('section', section);
    window.history.pushState({}, '', url.toString());
  };

  // Code examples as string constants
  const typeofGuardCode =
    "function isString(value: unknown): value is string {\n  return typeof value === 'string';\n}\n\nfunction isNumber(value: unknown): value is number {\n  return typeof value === 'number' && !isNaN(value);\n}\n\nfunction processValue(value: unknown): void {\n  if (isString(value)) {\n    // TypeScript knows value is string here\n    console.log('String length:', value.length);\n    console.log('Uppercase:', value.toUpperCase());\n  } else if (isNumber(value)) {\n    // TypeScript knows value is number here\n    console.log('Double value:', value * 2);\n    console.log('Is integer:', Number.isInteger(value));\n  } else {\n    console.log('Unknown type:', typeof value);\n  }\n}\n\n// Usage\nprocessValue('hello');  // String operations available\nprocessValue(42);       // Number operations available\nprocessValue(true);     // Unknown type";

  const instanceofGuardCode =
    "class Animal {\n  name: string;\n  constructor(name: string) { this.name = name; }\n  makeSound(): void { console.log('Some sound'); }\n}\n\nclass Dog extends Animal {\n  breed: string;\n  constructor(name: string, breed: string) {\n    super(name);\n    this.breed = breed;\n  }\n  makeSound(): void { console.log('Woof!'); }\n  fetch(): void { console.log('Fetching ball'); }\n}\n\nclass Cat extends Animal {\n  color: string;\n  constructor(name: string, color: string) {\n    super(name);\n    this.color = color;\n  }\n  makeSound(): void { console.log('Meow!'); }\n  scratch(): void { console.log('Scratching post'); }\n}\n\nfunction isDog(animal: Animal): animal is Dog {\n  return animal instanceof Dog;\n}\n\nfunction isCat(animal: Animal): animal is Cat {\n  return animal instanceof Cat;\n}\n\nfunction handleAnimal(animal: Animal): void {\n  animal.makeSound(); // Always available\n\n  if (isDog(animal)) {\n    // TypeScript knows animal is Dog\n    console.log('Breed:', animal.breed);\n    animal.fetch();\n  } else if (isCat(animal)) {\n    // TypeScript knows animal is Cat\n    console.log('Color:', animal.color);\n    animal.scratch();\n  }\n}\n\n// Usage\nconst dog = new Dog('Buddy', 'Golden Retriever');\nconst cat = new Cat('Whiskers', 'Black');\n\nhandleAnimal(dog); // Shows dog-specific methods\nhandleAnimal(cat); // Shows cat-specific methods";

  const inOperatorGuardCode =
    "interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\ninterface Admin extends User {\n  role: string;\n  permissions: string[];\n}\n\nfunction isAdmin(user: User): user is Admin {\n  return 'role' in user && 'permissions' in user;\n}\n\nfunction hasProperty<T extends object>(obj: T, prop: string): obj is T & Record<string, unknown> {\n  return prop in obj;\n}\n\nfunction processUser(user: User): void {\n  console.log('User:', user.name);\n\n  if (isAdmin(user)) {\n    // TypeScript knows user has role and permissions\n    console.log('Admin role:', user.role);\n    console.log('Permissions:', user.permissions.join(', '));\n  }\n\n  if (hasProperty(user, 'department')) {\n    // TypeScript knows user has department property\n    console.log('Department:', (user as any).department);\n  }\n}\n\n// Usage\nconst regularUser: User = {\n  id: 1,\n  name: 'John Doe',\n  email: 'john@example.com'\n};\n\nconst adminUser: Admin = {\n  id: 2,\n  name: 'Jane Admin',\n  email: 'jane@example.com',\n  role: 'superuser',\n  permissions: ['read', 'write', 'delete']\n};\n\nprocessUser(regularUser); // No admin properties\nprocessUser(adminUser);   // Shows admin properties";

  const discriminatedUnionsCode =
    "interface Circle {\n  kind: 'circle';\n  radius: number;\n}\n\ninterface Square {\n  kind: 'square';\n  sideLength: number;\n}\n\ninterface Triangle {\n  kind: 'triangle';\n  base: number;\n  height: number;\n}\n\ntype Shape = Circle | Square | Triangle;\n\nfunction getArea(shape: Shape): number {\n  switch (shape.kind) {\n    case 'circle':\n      // TypeScript knows shape is Circle\n      return Math.PI * shape.radius ** 2;\n\n    case 'square':\n      // TypeScript knows shape is Square\n      return shape.sideLength ** 2;\n\n    case 'triangle':\n      // TypeScript knows shape is Triangle\n      return (shape.base * shape.height) / 2;\n\n    default:\n      // TypeScript knows this case is never reached\n      const _exhaustiveCheck: never = shape;\n      throw new Error('Unknown shape kind');\n  }\n}\n\nfunction describeShape(shape: Shape): string {\n  switch (shape.kind) {\n    case 'circle':\n      return `Circle with radius ${shape.radius}`;\n    case 'square':\n      return `Square with side ${shape.sideLength}`;\n    case 'triangle':\n      return `Triangle with base ${shape.base} and height ${shape.height}`;\n  }\n}\n\n// Usage\nconst circle: Circle = { kind: 'circle', radius: 5 };\nconst square: Square = { kind: 'square', sideLength: 4 };\nconst triangle: Triangle = { kind: 'triangle', base: 3, height: 4 };\n\nconsole.log(getArea(circle));    // 78.54...\nconsole.log(getArea(square));    // 16\nconsole.log(getArea(triangle));  // 6";

  const customGuardCode =
    "interface ApiResponse<T> {\n  data: T;\n  status: number;\n  message?: string;\n}\n\ninterface ErrorResponse {\n  error: string;\n  code: number;\n  details?: any;\n}\n\ntype ApiResult<T> = ApiResponse<T> | ErrorResponse;\n\nfunction isApiResponse<T>(result: ApiResult<T>): result is ApiResponse<T> {\n  return 'data' in result && 'status' in result;\n}\n\nfunction isErrorResponse<T>(result: ApiResult<T>): result is ErrorResponse {\n  return 'error' in result && 'code' in result;\n}\n\nfunction handleApiResult<T>(result: ApiResult<T>): T | null {\n  if (isApiResponse(result)) {\n    // TypeScript knows result is ApiResponse<T>\n    console.log('Success:', result.message || 'OK');\n    return result.data;\n  } else if (isErrorResponse(result)) {\n    // TypeScript knows result is ErrorResponse\n    console.error('Error:', result.error);\n    console.error('Code:', result.code);\n    return null;\n  } else {\n    console.error('Unknown response format');\n    return null;\n  }\n}\n\n// Usage\nconst successResponse: ApiResponse<string[]> = {\n  data: ['item1', 'item2'],\n  status: 200,\n  message: 'Items retrieved successfully'\n};\n\nconst errorResponse: ErrorResponse = {\n  error: 'Not found',\n  code: 404,\n  details: { resource: 'user', id: '123' }\n};\n\nhandleApiResult(successResponse); // Returns data array\nhandleApiResult(errorResponse);   // Returns null, logs error";

  const assertionFunctionsCode =
    "interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\n// Assertion function\nfunction assertIsUser(obj: any): asserts obj is User {\n  if (!obj || typeof obj !== 'object') {\n    throw new Error('Object is not a valid user');\n  }\n  if (typeof obj.id !== 'number') {\n    throw new Error('User id must be a number');\n  }\n  if (typeof obj.name !== 'string') {\n    throw new Error('User name must be a string');\n  }\n  if (typeof obj.email !== 'string') {\n    throw new Error('User email must be a string');\n  }\n}\n\nfunction processUserData(data: any): User {\n  assertIsUser(data);\n  // TypeScript now knows data is User\n  return {\n    id: data.id,\n    name: data.name.toUpperCase(),\n    email: data.email.toLowerCase()\n  };\n}\n\n// Assertion function with predicate\nfunction assert(condition: any, message?: string): asserts condition {\n  if (!condition) {\n    throw new Error(message || 'Assertion failed');\n  }\n}\n\nfunction divide(a: number, b: number): number {\n  assert(b !== 0, 'Cannot divide by zero');\n  assert(typeof a === 'number' && typeof b === 'number', 'Both arguments must be numbers');\n  // TypeScript knows b is not zero and both are numbers\n  return a / b;\n}\n\n// Usage\ntry {\n  const user = processUserData({\n    id: 1,\n    name: 'John',\n    email: 'john@example.com'\n  });\n  console.log('Processed user:', user);\n\n  console.log('Division result:', divide(10, 2));\n} catch (error) {\n  console.error('Error:', error.message);\n}";

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Type Guards</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Type guards are functions that perform runtime checks to narrow down the type of a
          variable within a conditional block.
        </p>
      </div>
      <StatsGrid
        stats={[
          { label: 'typeof Guards', value: 'Primitive type checks' },
          { label: 'instanceof Guards', value: 'Class instance checks' },
          { label: 'in Operator', value: 'Property existence checks' },
          { label: 'Discriminated Unions', value: 'Type narrowing with literals' },
        ]}
        colorScheme="indigo"
      />
    </div>
  );

  const mainContent = (
    <>
      {/* typeof Guards */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">typeof Guards</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">Basic typeof Guards</h3>
            <pre className="bg-gray-900 text-indigo-400 p-4 rounded-lg text-sm overflow-x-auto">
              {typeofGuardCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-600 mb-3">instanceof Guards</h3>
            <pre className="bg-gray-900 text-purple-400 p-4 rounded-lg text-sm overflow-x-auto">
              {instanceofGuardCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Property and Union Guards */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Property and Union Guards</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-3">in Operator Guards</h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {inOperatorGuardCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-3">Discriminated Unions</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
              {discriminatedUnionsCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Advanced Type Guards */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Type Guards</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">
              Custom API Response Guards
            </h3>
            <pre className="bg-gray-900 text-indigo-400 p-4 rounded-lg text-sm overflow-x-auto">
              {customGuardCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-600 mb-3">Assertion Functions</h3>
            <pre className="bg-gray-900 text-purple-400 p-4 rounded-lg text-sm overflow-x-auto">
              {assertionFunctionsCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Best Practices */}
      <ThemeCard>
        <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Type Guard Best Practices</h3>
          <ul className="text-blue-700 space-y-2">
            <li>
              <strong>User-Defined Type Guards:</strong> Return type predicates like{' '}
              <code>value is Type</code>
            </li>
            <li>
              <strong>Assertion Functions:</strong> Use <code>asserts value is Type</code> for
              runtime assertions
            </li>
            <li>
              <strong>Discriminated Unions:</strong> Use literal types to enable exhaustive checking
            </li>
            <li>
              <strong>Performance:</strong> Type guards should be lightweight and avoid complex
              computations
            </li>
            <li>
              <strong>Completeness:</strong> Handle all possible cases to avoid runtime errors
            </li>
          </ul>
        </div>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <>
      <ThemeCard>
        <NavigationCard
          title="Decorators"
          description="Advanced metadata and behavior modification"
          colorScheme="indigo"
          onClick={() => navigateToSection('Decorators')}
        />
      </ThemeCard>
      <ThemeCard>
        <NavigationCard
          title="Best Practices"
          description="TypeScript development guidelines"
          colorScheme="indigo"
          onClick={() => navigateToSection('Best Practices')}
        />
      </ThemeCard>
      <ThemeCard>
        <NavigationCard
          title="Migration Guide"
          description="Converting JavaScript to TypeScript"
          colorScheme="indigo"
          onClick={() => navigateToSection('Migration Guide')}
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
        title="Explore Best Practices"
        description="Learn TypeScript development best practices and common patterns"
        buttonText="Next: Best Practices"
        onButtonClick={() => navigateToSection('Best Practices')}
        colorScheme="indigo"
      />
    </>
  );
};

export default TypeGuards;
