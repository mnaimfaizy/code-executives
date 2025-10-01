import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import StatsGrid from '../../components/shared/StatsGrid';

const Decorators: React.FC = () => {
  const navigateToSection = (section: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('section', section);
    window.history.pushState({}, '', url.toString());
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Decorators</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Decorators are a powerful TypeScript feature that allows you to add metadata and modify
          the behavior of classes, methods, properties, and parameters at design time.
        </p>
      </div>
      <StatsGrid
        stats={[
          { label: 'Class Decorators', value: 'Modify constructors' },
          { label: 'Method Decorators', value: 'Intercept method calls' },
          { label: 'Property Decorators', value: 'Transform property access' },
          { label: 'Parameter Decorators', value: 'Validate method arguments' },
        ]}
        colorScheme="indigo"
      />
    </div>
  );

  // Code examples as string constants
  const classDecoratorCode =
    "// Class decorator\nfunction Logger(constructor: Function) {\n  console.log('Class created:', constructor.name);\n}\n\n@Logger\nclass Person {\n  constructor(public name: string) {}\n}\n\n// Usage\nconst person = new Person('Alice');\n// Output: \"Class created: Person\"\n\n// Class decorator with constructor modification\nfunction Injectable(constructor: Function) {\n  // Store original constructor\n  const original = constructor;\n\n  // Create new constructor function\n  const newConstructor: any = function (...args: any[]) {\n    console.log('Creating instance of', original.name);\n    return new original(...args);\n  };\n\n  // Copy prototype\n  newConstructor.prototype = original.prototype;\n\n  return newConstructor;\n}\n\n@Injectable\nclass Service {\n  constructor() {\n    console.log('Service initialized');\n  }\n}\n\nconst service = new Service();\n// Output: \"Creating instance of Service\"\n// Output: \"Service initialized\"";

  const methodDecoratorCode =
    '// Method decorator\nfunction LogExecution(\n  target: any,\n  propertyKey: string,\n  descriptor: PropertyDescriptor\n) {\n  const originalMethod = descriptor.value;\n\n  descriptor.value = function (...args: any[]) {\n    console.log(`Executing ${propertyKey} with args:`, args);\n    const result = originalMethod.apply(this, args);\n    console.log(`Method ${propertyKey} returned:`, result);\n    return result;\n  };\n\n  return descriptor;\n}\n\nclass Calculator {\n  @LogExecution\n  add(a: number, b: number): number {\n    return a + b;\n  }\n\n  @LogExecution\n  multiply(a: number, b: number): number {\n    return a * b;\n  }\n}\n\nconst calc = new Calculator();\ncalc.add(5, 3); // Logs execution and result\ncalc.multiply(4, 2); // Logs execution and result\n\n// Method decorator with timing\nfunction Timing(\n  target: any,\n  propertyKey: string,\n  descriptor: PropertyDescriptor\n) {\n  const originalMethod = descriptor.value;\n\n  descriptor.value = function (...args: any[]) {\n    const start = performance.now();\n    const result = originalMethod.apply(this, args);\n    const end = performance.now();\n    console.log(`${propertyKey} took ${(end - start).toFixed(2)}ms`);\n    return result;\n  };\n\n  return descriptor;\n}\n\nclass DataProcessor {\n  @Timing\n  processLargeData(data: number[]): number {\n    return data.reduce((sum, num) => sum + num, 0);\n  }\n}';

  const propertyDecoratorCode =
    "// Property decorator\nfunction Required(target: any, propertyKey: string) {\n  // Store metadata about required properties\n  const requiredProps = Reflect.getMetadata('required', target) || [];\n  requiredProps.push(propertyKey);\n  Reflect.defineMetadata('required', requiredProps, target);\n}\n\n// Validation decorator\nfunction Validate(target: any, propertyKey: string) {\n  let value: any;\n\n  const getter = () => value;\n  const setter = (newValue: any) => {\n    // Add validation logic here\n    if (propertyKey === 'email' && !newValue.includes('@')) {\n      throw new Error('Invalid email format');\n    }\n    value = newValue;\n  };\n\n  Object.defineProperty(target, propertyKey, {\n    get: getter,\n    set: setter,\n    enumerable: true,\n    configurable: true\n  });\n}\n\nclass User {\n  @Required\n  @Validate\n  name: string;\n\n  @Required\n  @Validate\n  email: string;\n\n  constructor(name: string, email: string) {\n    this.name = name;\n    this.email = email;\n  }\n}\n\n// Property decorator for default values\nfunction DefaultValue(defaultVal: any) {\n  return function (target: any, propertyKey: string) {\n    let value = defaultVal;\n\n    Object.defineProperty(target, propertyKey, {\n      get: () => value,\n      set: (newValue: any) => {\n        value = newValue !== undefined ? newValue : defaultVal;\n      },\n      enumerable: true,\n      configurable: true\n    });\n  };\n}\n\nclass Config {\n  @DefaultValue('localhost')\n  host: string;\n\n  @DefaultValue(3000)\n  port: number;\n}\n\nconst config = new Config();\nconsole.log(config.host); // 'localhost'\nconsole.log(config.port); // 3000";

  const parameterDecoratorCode =
    "// Parameter decorator\nfunction Inject(serviceName: string) {\n  return function (target: any, propertyKey: string, parameterIndex: number) {\n    // Store injection metadata\n    const injections = Reflect.getMetadata('injections', target, propertyKey) || [];\n    injections[parameterIndex] = serviceName;\n    Reflect.defineMetadata('injections', injections, target, propertyKey);\n  };\n}\n\nclass DatabaseService {\n  connect() {\n    console.log('Connected to database');\n  }\n}\n\nclass LoggerService {\n  log(message: string) {\n    console.log('LOG:', message);\n  }\n}\n\nclass UserService {\n  constructor(\n    @Inject('database') private db: DatabaseService,\n    @Inject('logger') private logger: LoggerService\n  ) {}\n\n  createUser(name: string) {\n    this.logger.log(`Creating user: ${name}`);\n    this.db.connect();\n    // Create user logic...\n  }\n}\n\n// Parameter decorator for validation\nfunction MinLength(minLength: number) {\n  return function (target: any, propertyKey: string, parameterIndex: number) {\n    const validations = Reflect.getMetadata('validations', target, propertyKey) || [];\n    validations[parameterIndex] = { type: 'minLength', value: minLength };\n    Reflect.defineMetadata('validations', validations, target, propertyKey);\n  };\n}\n\nfunction MaxLength(maxLength: number) {\n  return function (target: any, propertyKey: string, parameterIndex: number) {\n    const validations = Reflect.getMetadata('validations', target, propertyKey) || [];\n    validations[parameterIndex] = { type: 'maxLength', value: maxLength };\n    Reflect.defineMetadata('validations', validations, target, propertyKey);\n  };\n}\n\nclass ValidationService {\n  validate(\n    @MinLength(3)\n    @MaxLength(50)\n    name: string,\n    @MinLength(5)\n    password: string\n  ): boolean {\n    // Validation logic would go here\n    return true;\n  }\n}";

  const decoratorFactoryCode =
    "// Decorator factory pattern\nfunction Debounce(delay: number) {\n  return function (\n    target: any,\n    propertyKey: string,\n    descriptor: PropertyDescriptor\n  ) {\n    const originalMethod = descriptor.value;\n    let timeoutId: NodeJS.Timeout;\n\n    descriptor.value = function (...args: any[]) {\n      clearTimeout(timeoutId);\n      timeoutId = setTimeout(() => {\n        originalMethod.apply(this, args);\n      }, delay);\n    };\n\n    return descriptor;\n  };\n}\n\nclass SearchService {\n  @Debounce(300)\n  search(query: string) {\n    console.log('Searching for:', query);\n    // Perform search...\n  }\n}\n\nconst searchService = new SearchService();\nsearchService.search('a'); // Won't execute immediately\nsearchService.search('ab'); // Cancels previous, won't execute\nsearchService.search('abc'); // Executes after 300ms delay\n\n// Decorator composition\nfunction Memoize() {\n  return function (\n    target: any,\n    propertyKey: string,\n    descriptor: PropertyDescriptor\n  ) {\n    const originalMethod = descriptor.value;\n    const cache = new Map();\n\n    descriptor.value = function (...args: any[]) {\n      const key = JSON.stringify(args);\n      if (cache.has(key)) {\n        return cache.get(key);\n      }\n\n      const result = originalMethod.apply(this, args);\n      cache.set(key, result);\n      return result;\n    };\n\n    return descriptor;\n  };\n}\n\nclass MathService {\n  @Memoize()\n  fibonacci(n: number): number {\n    if (n <= 1) return n;\n    return this.fibonacci(n - 1) + this.fibonacci(n - 2);\n  }\n}\n\nconst math = new MathService();\nconsole.log(math.fibonacci(10)); // Calculates\nconsole.log(math.fibonacci(10)); // Returns cached result";

  const experimentalDecoratorsCode =
    "// Enable experimental decorators in tsconfig.json\n{\n  \"compilerOptions\": {\n    \"experimentalDecorators\": true,\n    \"emitDecoratorMetadata\": true\n  }\n}\n\n// Angular-style component decorator\nfunction Component(config: { selector: string; template: string }) {\n  return function (constructor: Function) {\n    // Add metadata to constructor\n    constructor.prototype.selector = config.selector;\n    constructor.prototype.template = config.template;\n\n    // Register component globally\n    (window as any).registeredComponents = \n      (window as any).registeredComponents || [];\n    (window as any).registeredComponents.push(constructor);\n  };\n}\n\n@Component({\n  selector: 'my-component',\n  template: '<div>Hello World</div>'\n})\nclass MyComponent {\n  render() {\n    return this.template;\n  }\n}\n\n// Method decorator for HTTP requests\nfunction Get(url: string) {\n  return function (\n    target: any,\n    propertyKey: string,\n    descriptor: PropertyDescriptor\n  ) {\n    descriptor.value = function () {\n      return fetch(url).then(res => res.json());\n    };\n    return descriptor;\n  };\n}\n\nfunction Post(url: string) {\n  return function (\n    target: any,\n    propertyKey: string,\n    descriptor: PropertyDescriptor\n  ) {\n    descriptor.value = function (data: any) {\n      return fetch(url, {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify(data)\n      }).then(res => res.json());\n    };\n    return descriptor;\n  };\n}\n\nclass ApiService {\n  @Get('/api/users')\n  getUsers() {}\n\n  @Post('/api/users')\n  createUser(data: any) {}\n}\n\nconst api = new ApiService();\napi.getUsers().then(users => console.log(users));\napi.createUser({ name: 'John' }).then(result => console.log(result));";

  const mainContent = (
    <>
      {/* Class Decorators */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Class Decorators</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">Basic Class Decorator</h3>
            <pre className="bg-gray-900 text-indigo-400 p-4 rounded-lg text-sm overflow-x-auto">
              {classDecoratorCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-600 mb-3">
              When to Use Class Decorators
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-1">Logging</h4>
                <p className="text-purple-600 text-sm">Track class instantiation and usage</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-1">Dependency Injection</h4>
                <p className="text-purple-600 text-sm">Register classes with DI containers</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-1">Serialization</h4>
                <p className="text-purple-600 text-sm">Add serialization/deserialization logic</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-1">Framework Integration</h4>
                <p className="text-purple-600 text-sm">Component registration (Angular, etc.)</p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Method Decorators */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Method Decorators</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-3">
              Logging & Timing Decorators
            </h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {methodDecoratorCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-3">
              Common Method Decorator Patterns
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-1">Caching/Memoization</h4>
                <p className="text-green-600 text-sm">Cache expensive method results</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-1">Debouncing</h4>
                <p className="text-green-600 text-sm">Delay method execution</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-1">Authorization</h4>
                <p className="text-green-600 text-sm">Check permissions before execution</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-1">Retry Logic</h4>
                <p className="text-green-600 text-sm">Automatically retry failed operations</p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Property Decorators */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Decorators</h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">
              Validation & Default Values
            </h3>
            <pre className="bg-gray-900 text-indigo-400 p-4 rounded-lg text-sm overflow-x-auto">
              {propertyDecoratorCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Parameter Decorators */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Parameter Decorators</h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-purple-600 mb-3">
              Dependency Injection & Validation
            </h3>
            <pre className="bg-gray-900 text-purple-400 p-4 rounded-lg text-sm overflow-x-auto">
              {parameterDecoratorCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Decorator Factories */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Decorator Factories & Composition</h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-3">Advanced Patterns</h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {decoratorFactoryCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Experimental Decorators */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Experimental Decorators</h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-3">Framework Integration</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
              {experimentalDecoratorsCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Best Practices */}
      <ThemeCard>
        <div className="p-6 bg-indigo-50 rounded-lg border border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-800 mb-4">Decorator Best Practices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-indigo-700 mb-3">Do's</h4>
              <ul className="text-indigo-600 text-sm space-y-1">
                <li>• Use decorator factories for configuration</li>
                <li>• Keep decorators pure and side-effect free</li>
                <li>• Document decorator behavior clearly</li>
                <li>• Use metadata reflection for complex scenarios</li>
                <li>• Test decorators thoroughly</li>
                <li>• Consider performance implications</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-700 mb-3">Don'ts</h4>
              <ul className="text-indigo-600 text-sm space-y-1">
                <li>• Don't modify prototypes directly</li>
                <li>• Avoid complex logic in decorators</li>
                <li>• Don't rely on decorator execution order</li>
                <li>• Avoid circular dependencies</li>
                <li>• Don't use decorators for business logic</li>
                <li>• Be careful with inheritance and decorators</li>
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
          title="Advanced TypeScript"
          description="Overview of advanced features"
          colorScheme="indigo"
          onClick={() => navigateToSection('Advanced TypeScript')}
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
      <ThemeCard>
        <NavigationCard
          title="Generics"
          description="Type-safe generic programming"
          colorScheme="indigo"
          onClick={() => navigateToSection('Generics')}
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
        description="Learn about complex type compositions and utility types in TypeScript"
        buttonText="Next: Advanced Types"
        onButtonClick={() => navigateToSection('Advanced Types')}
        colorScheme="indigo"
      />
    </>
  );
};

export default Decorators;
