import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';

const AdvancedTypeScript: React.FC = () => {
  const navigate = useNavigate();

  const navigateToSection = (sectionName: string) => {
    const encodedSection = encodeURIComponent(sectionName);
    navigate(`/typescript?section=${encodedSection}`);
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Advanced TypeScript</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Master advanced TypeScript features including generics, decorators, advanced types, and
          type guards for robust type-safe applications
        </p>
      </div>
    </div>
  );

  const mainContent = (
    <>
      {/* Overview */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced TypeScript Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 text-center">
            <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">G</span>
            </div>
            <h3 className="font-semibold text-indigo-800 mb-2">Generics</h3>
            <p className="text-indigo-700 text-sm">Reusable components with type parameters</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">@</span>
            </div>
            <h3 className="font-semibold text-purple-800 mb-2">Decorators</h3>
            <p className="text-purple-700 text-sm">Meta-programming for classes and members</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">T</span>
            </div>
            <h3 className="font-semibold text-blue-800 mb-2">Advanced Types</h3>
            <p className="text-blue-700 text-sm">Complex type compositions and utilities</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">?</span>
            </div>
            <h3 className="font-semibold text-green-800 mb-2">Type Guards</h3>
            <p className="text-green-700 text-sm">Runtime type checking and narrowing</p>
          </div>
        </div>
      </ThemeCard>

      {/* Generics */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Generics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">Generic Functions</h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {`// Generic function
function identity<T>(arg: T): T {
  return arg;
}

// Usage with different types
const num = identity<number>(42);        // number
const str = identity<string>("hello");   // string
const bool = identity(true);             // boolean (inferred)

// Generic with constraints
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: "Alice", age: 30 };
const name = getProperty(person, "name");     // string
const age = getProperty(person, "age");      // number
// const invalid = getProperty(person, "invalid"); // Error!`}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Generic Classes</h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {`class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

// Usage
const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
console.log(numberStack.pop()); // 2

const stringStack = new Stack<string>();
stringStack.push("hello");
stringStack.push("world");
console.log(stringStack.pop()); // "world"`}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Advanced Types */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Types</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-3">Union & Intersection Types</h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {`// Union types (OR)
type StringOrNumber = string | number;
type Status = "success" | "error" | "loading";

function processValue(value: StringOrNumber): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  } else {
    return value.toString();
  }
}

// Intersection types (AND)
type Name = { name: string };
type Age = { age: number };
type Person = Name & Age; // Must have both name and age

const person: Person = {
  name: "Alice",
  age: 30
};

// Discriminated unions
type Circle = { kind: "circle"; radius: number };
type Square = { kind: "square"; sideLength: number };
type Shape = Circle | Square;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.sideLength ** 2;
  }
}`}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-600 mb-3">Utility Types</h3>
            <pre className="bg-gray-900 text-purple-400 p-4 rounded-lg text-sm overflow-x-auto">
              {`interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

// Partial - makes all properties optional
type PartialTodo = Partial<Todo>;
// { id?: number; title?: string; completed?: boolean; createdAt?: Date; }

// Required - makes all properties required
type RequiredTodo = Required<PartialTodo>;

// Pick - select specific properties
type TodoPreview = Pick<Todo, "id" | "title">;
// { id: number; title: string; }

// Omit - exclude specific properties
type TodoWithoutId = Omit<Todo, "id">;
// { title: string; completed: boolean; createdAt: Date; }

// Readonly - makes all properties readonly
type ReadonlyTodo = Readonly<Todo>;

// Record - create object type with specific key/value types
type StringDictionary = Record<string, string>;
const dict: StringDictionary = {
  "key1": "value1",
  "key2": "value2"
};

// Extract/Exclude - work with union types
type FunctionProps = Extract<string | number | (() => void), Function>;
type NonFunctionProps = Exclude<string | number | (() => void), Function>;`}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Type Guards */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Type Guards</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-3">Custom Type Guards</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
              {`// Type guard function
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

// Using type guards
function processValue(value: unknown): string {
  if (isString(value)) {
    // TypeScript knows value is string here
    return value.toUpperCase();
  } else if (isNumber(value)) {
    // TypeScript knows value is number here
    return value.toFixed(2);
  } else {
    return "Unknown type";
  }
}

// Interface type guards
interface Bird {
  fly(): void;
  layEggs(): void;
}

interface Fish {
  swim(): void;
  layEggs(): void;
}

function isBird(pet: Bird | Fish): pet is Bird {
  return (pet as Bird).fly !== undefined;
}

function getPetAction(pet: Bird | Fish): string {
  if (isBird(pet)) {
    return pet.fly(); // TypeScript knows this is a Bird
  } else {
    return pet.swim(); // TypeScript knows this is a Fish
  }
}`}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Built-in Type Guards</h3>
            <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg text-sm overflow-x-auto">
              {`// typeof type guards
function padLeft(value: string, padding: string | number): string {
  if (typeof padding === "number") {
    // padding is narrowed to number
    return " ".repeat(padding) + value;
  } else {
    // padding is narrowed to string
    return padding + value;
  }
}

// instanceof type guards
class Dog {
  bark() { console.log("Woof!"); }
}

class Cat {
  meow() { console.log("Meow!"); }
}

function makeSound(animal: Dog | Cat): void {
  if (animal instanceof Dog) {
    // animal is narrowed to Dog
    animal.bark();
  } else {
    // animal is narrowed to Cat
    animal.meow();
  }
}

// in operator type guards
interface Car {
  drive(): void;
}

interface Boat {
  sail(): void;
}

function operate(vehicle: Car | Boat): void {
  if ("drive" in vehicle) {
    // vehicle is narrowed to Car
    vehicle.drive();
  } else {
    // vehicle is narrowed to Boat
    vehicle.sail();
  }
}`}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Decorators */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Decorators</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-purple-600 mb-3">Class Decorators</h3>
            <pre className="bg-gray-900 text-purple-400 p-4 rounded-lg text-sm overflow-x-auto">
              {`// Class decorator
function Logger(constructor: Function) {
  console.log(\`Class \${constructor.name} is being created\`);
}

// Method decorator
function LogMethod(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(\`Calling \${propertyName} with args: \`, args);
    const result = method.apply(this, args);
    console.log(\`Method \${propertyName} returned: \`, result);
    return result;
  };
}

// Property decorator
function Required(target: any, propertyName: string) {
  // Store metadata about required properties
  const requiredProps = Reflect.getMetadata('required', target) || [];
  requiredProps.push(propertyName);
  Reflect.defineMetadata('required', requiredProps, target);
}

@Logger
class UserService {
  @Required
  name: string;

  @Required
  email: string;

  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
  }

  @LogMethod
  save(): boolean {
    // Save logic here
    return true;
  }
}

// Usage
const service = new UserService("Alice", "alice@example.com");
service.save(); // Logs method calls`}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Decorator Factory</h3>
            <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg text-sm overflow-x-auto">
              {`// Decorator factory - returns a decorator
function MinLength(minLength: number) {
  return function (target: any, propertyName: string) {
    let value: string;

    const getter = () => value;
    const setter = (newValue: string) => {
      if (newValue.length < minLength) {
        throw new Error(\`\${propertyName} must be at least \${minLength} characters\`);
      }
      value = newValue;
    };

    Object.defineProperty(target, propertyName, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
  };
}

// Parameter decorator
function LogParameter(target: any, methodName: string, parameterIndex: number) {
  const metadataKey = \`log_\${methodName}_parameters\`;
  const parameterIndexes = Reflect.getMetadata(metadataKey, target) || [];
  parameterIndexes.push(parameterIndex);
  Reflect.defineMetadata(metadataKey, parameterIndexes, target);
}

class Product {
  @MinLength(3)
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  updateName(@LogParameter newName: string): void {
    console.log(\`Updating name to: \${newName}\`);
    this.name = newName;
  }
}

// Usage
const product = new Product("Valid Name");
// const invalid = new Product("X"); // Error: name must be at least 3 characters
product.updateName("New Name"); // Logs parameter`}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Practical Example */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Complete Example: Generic Data Store
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">Generic Data Store</h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {`// Generic interface with constraints
interface Identifiable {
  id: string;
}

interface Repository<T extends Identifiable> {
  findById(id: string): T | undefined;
  save(entity: T): void;
  delete(id: string): boolean;
  findAll(): T[];
}

// Generic implementation
class InMemoryRepository<T extends Identifiable> implements Repository<T> {
  private storage = new Map<string, T>();

  findById(id: string): T | undefined {
    return this.storage.get(id);
  }

  save(entity: T): void {
    this.storage.set(entity.id, entity);
  }

  delete(id: string): boolean {
    return this.storage.delete(id);
  }

  findAll(): T[] {
    return Array.from(this.storage.values());
  }
}

// Type guard for runtime type checking
function isIdentifiable(obj: any): obj is Identifiable {
  return obj && typeof obj.id === 'string';
}

// Usage with different entity types
interface User extends Identifiable {
  name: string;
  email: string;
}

interface Product extends Identifiable {
  name: string;
  price: number;
}

const userRepo = new InMemoryRepository<User>();
const productRepo = new InMemoryRepository<Product>();

// Type-safe operations
userRepo.save({ id: "1", name: "Alice", email: "alice@example.com" });
productRepo.save({ id: "1", name: "Laptop", price: 999.99 });

const user = userRepo.findById("1"); // User | undefined
const product = productRepo.findById("1"); // Product | undefined`}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-3">Advanced Type Guards</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
              {`// Advanced type guard with discriminated unions
type ApiResponse<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { status: 'success' } {
  return response.status === 'success';
}

function isErrorResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { status: 'error' } {
  return response.status === 'error';
}

// Generic API handler
async function handleApiResponse<T>(response: ApiResponse<T>): Promise<T> {
  if (isSuccessResponse(response)) {
    // TypeScript knows response.data exists and is of type T
    return response.data;
  } else if (isErrorResponse(response)) {
    // TypeScript knows response.error exists
    throw new Error(response.error);
  } else {
    throw new Error('Unknown response type');
  }
}

// Decorator for validation
function ValidateInput(validationFn: (input: any) => boolean) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    descriptor.value = function (...args: any[]) {
      for (const arg of args) {
        if (!validationFn(arg)) {
          throw new Error(\`Invalid input for \${propertyName}\`);
        }
      }
      return method.apply(this, args);
    };
  };
}

class ApiService {
  @ValidateInput((data) => data && typeof data === 'object')
  async createUser(@LogParameter userData: any): Promise<User> {
    // API call logic here
    return { id: '123', ...userData };
  }
}`}
            </pre>
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
          description="Deep dive into generic types"
          colorScheme="indigo"
          onClick={() => navigateToSection('Generics')}
        />
      </ThemeCard>
      <ThemeCard>
        <NavigationCard
          title="Decorators"
          description="Meta-programming with decorators"
          colorScheme="indigo"
          onClick={() => navigateToSection('Decorators')}
        />
      </ThemeCard>
      <ThemeCard>
        <NavigationCard
          title="Advanced Types"
          description="Complex type compositions"
          colorScheme="indigo"
          onClick={() => navigateToSection('Advanced Types')}
        />
      </ThemeCard>
      <ThemeCard>
        <NavigationCard
          title="Type Guards"
          description="Runtime type checking"
          colorScheme="indigo"
          onClick={() => navigateToSection('Type Guards')}
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
        title="Explore Generics"
        description="Learn how to create reusable, type-safe components with generic types"
        buttonText="Next: Generics"
        onButtonClick={() => navigateToSection('Generics')}
        colorScheme="indigo"
      />
    </>
  );
};

export default AdvancedTypeScript;
