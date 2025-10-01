import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import StatsGrid from '../../components/shared/StatsGrid';

const Polymorphism: React.FC = () => {
  const navigateToSection = (section: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('section', section);
    window.history.pushState({}, '', url.toString());
  };

  // Code examples as string constants
  const methodOverridingCode =
    "class Animal {\n  makeSound(): void {\n    console.log('Some generic animal sound');\n  }\n}\n\nclass Dog extends Animal {\n  makeSound(): void {\n    console.log('Woof!');\n  }\n}\n\nclass Cat extends Animal {\n  makeSound(): void {\n    console.log('Meow!');\n  }\n}\n\n// Polymorphism in action\nfunction animalSound(animal: Animal): void {\n  animal.makeSound(); // Calls the appropriate method\n}\n\n// Usage\nconst dog = new Dog();\nconst cat = new Cat();\n\nanimalSound(dog); // \"Woof!\"\nanimalSound(cat); // \"Meow!\"";

  const parametricPolymorphismCode =
    "class Stack<T> {\n  private items: T[] = [];\n\n  push(item: T): void {\n    this.items.push(item);\n  }\n\n  pop(): T | undefined {\n    return this.items.pop();\n  }\n\n  peek(): T | undefined {\n    return this.items[this.items.length - 1];\n  }\n\n  isEmpty(): boolean {\n    return this.items.length === 0;\n  }\n}\n\n// Usage with different types\nconst numberStack = new Stack<number>();\nnumberStack.push(1);\nnumberStack.push(2);\nconsole.log(numberStack.pop()); // 2\n\nconst stringStack = new Stack<string>();\nstringStack.push('hello');\nstringStack.push('world');\nconsole.log(stringStack.pop()); // \"world\"\n\n// Type safety enforced\nconst mixedStack = new Stack<number>();\n// mixedStack.push('string'); // Error: Argument of type 'string' is not assignable to parameter of type 'number'";

  const subtypePolymorphismCode =
    "interface Shape {\n  area(): number;\n  perimeter(): number;\n}\n\nclass Rectangle implements Shape {\n  constructor(private width: number, private height: number) {}\n\n  area(): number {\n    return this.width * this.height;\n  }\n\n  perimeter(): number {\n    return 2 * (this.width + this.height);\n  }\n}\n\nclass Circle implements Shape {\n  constructor(private radius: number) {}\n\n  area(): number {\n    return Math.PI * this.radius * this.radius;\n  }\n\n  perimeter(): number {\n    return 2 * Math.PI * this.radius;\n  }\n}\n\n// Polymorphic function\nfunction printShapeInfo(shape: Shape): void {\n  console.log('Area:', shape.area());\n  console.log('Perimeter:', shape.perimeter());\n}\n\nfunction totalArea(shapes: Shape[]): number {\n  return shapes.reduce((total, shape) => total + shape.area(), 0);\n}\n\n// Usage\nconst shapes: Shape[] = [\n  new Rectangle(10, 5),\n  new Circle(7),\n  new Rectangle(3, 4)\n];\n\nshapes.forEach(shape => printShapeInfo(shape));\nconsole.log('Total area:', totalArea(shapes));";

  const adHocPolymorphismCode =
    '// Function overloading\nfunction add(a: number, b: number): number;\nfunction add(a: string, b: string): string;\nfunction add(a: any, b: any): any {\n  return a + b;\n}\n\n// Usage\nconsole.log(add(5, 3));       // 8\nconsole.log(add(\'Hello \', \'World\')); // "Hello World"\n\n// Operator overloading simulation\nclass Vector2D {\n  constructor(public x: number, public y: number) {}\n\n  add(other: Vector2D): Vector2D {\n    return new Vector2D(this.x + other.x, this.y + other.y);\n  }\n\n  toString(): string {\n    return `(${this.x}, ${this.y})`;\n  }\n}\n\n// Usage\nconst v1 = new Vector2D(1, 2);\nconst v2 = new Vector2D(3, 4);\nconst result = v1.add(v2);\nconsole.log(result.toString()); // "(4, 6)"';

  const runtimePolymorphismCode =
    "abstract class PaymentProcessor {\n  abstract processPayment(amount: number): boolean;\n\n  refund(amount: number): boolean {\n    console.log('Processing refund of $' + amount);\n    return true;\n  }\n}\n\nclass CreditCardProcessor extends PaymentProcessor {\n  processPayment(amount: number): boolean {\n    console.log('Processing credit card payment of $' + amount);\n    // Credit card specific logic\n    return Math.random() > 0.1; // 90% success rate\n  }\n}\n\nclass PayPalProcessor extends PaymentProcessor {\n  processPayment(amount: number): boolean {\n    console.log('Processing PayPal payment of $' + amount);\n    // PayPal specific logic\n    return Math.random() > 0.05; // 95% success rate\n  }\n}\n\nclass BankTransferProcessor extends PaymentProcessor {\n  processPayment(amount: number): boolean {\n    console.log('Processing bank transfer of $' + amount);\n    // Bank transfer specific logic\n    return Math.random() > 0.2; // 80% success rate\n  }\n}\n\n// Polymorphic payment processing\nfunction processOrder(processor: PaymentProcessor, amount: number): void {\n  if (processor.processPayment(amount)) {\n    console.log('Payment successful');\n  } else {\n    console.log('Payment failed');\n    processor.refund(amount);\n  }\n}\n\n// Usage\nconst processors = [\n  new CreditCardProcessor(),\n  new PayPalProcessor(),\n  new BankTransferProcessor()\n];\n\nprocessors.forEach(processor => {\n  processOrder(processor, 100);\n});";

  const duckTypingPolymorphismCode =
    "// Structural typing enables duck typing\ninterface CanFly {\n  fly(): void;\n}\n\ninterface CanSwim {\n  swim(): void;\n}\n\nclass Duck {\n  fly(): void {\n    console.log('Duck flying');\n  }\n\n  swim(): void {\n    console.log('Duck swimming');\n  }\n}\n\nclass Airplane {\n  fly(): void {\n    console.log('Airplane flying');\n  }\n}\n\nclass Fish {\n  swim(): void {\n    console.log('Fish swimming');\n  }\n}\n\n// Functions that work with any object that has the right shape\nfunction makeItFly(flyer: CanFly): void {\n  flyer.fly();\n}\n\nfunction makeItSwim(swimmer: CanSwim): void {\n  swimmer.swim();\n}\n\n// Usage\nconst duck = new Duck();\nconst plane = new Airplane();\nconst fish = new Fish();\n\nmakeItFly(duck);   // Works\nmakeItFly(plane);  // Works (structural typing)\n// makeItFly(fish); // Error: Fish doesn't have fly method\n\nmakeItSwim(duck);  // Works\nmakeItSwim(fish);  // Works\n// makeItSwim(plane); // Error: Airplane doesn't have swim method";

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Polymorphism</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Polymorphism allows objects of different types to be treated as objects of a common type,
          enabling flexible and extensible code.
        </p>
      </div>
      <StatsGrid
        stats={[
          { label: 'Method Overriding', value: 'Runtime behavior modification' },
          { label: 'Subtype Polymorphism', value: 'Interface-based abstraction' },
          { label: 'Parametric Polymorphism', value: 'Generic type parameters' },
          { label: 'Ad-hoc Polymorphism', value: 'Function overloading' },
        ]}
        colorScheme="indigo"
      />
    </div>
  );

  const mainContent = (
    <>
      {/* Types of Polymorphism */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Types of Polymorphism</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">Method Overriding</h3>
            <pre className="bg-gray-900 text-indigo-400 p-4 rounded-lg text-sm overflow-x-auto">
              {methodOverridingCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-600 mb-3">Parametric Polymorphism</h3>
            <pre className="bg-gray-900 text-purple-400 p-4 rounded-lg text-sm overflow-x-auto">
              {parametricPolymorphismCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Subtype and Ad-hoc Polymorphism */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Subtype and Ad-hoc Polymorphism</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-3">Subtype Polymorphism</h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {subtypePolymorphismCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-3">Ad-hoc Polymorphism</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
              {adHocPolymorphismCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Runtime Polymorphism */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Runtime Polymorphism</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">
              Abstract Classes & Polymorphism
            </h3>
            <pre className="bg-gray-900 text-indigo-400 p-4 rounded-lg text-sm overflow-x-auto">
              {runtimePolymorphismCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-600 mb-3">
              Duck Typing with Interfaces
            </h3>
            <pre className="bg-gray-900 text-purple-400 p-4 rounded-lg text-sm overflow-x-auto">
              {duckTypingPolymorphismCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Benefits and Best Practices */}
      <ThemeCard>
        <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Polymorphism Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-700 mb-3">Advantages</h4>
              <ul className="text-blue-600 text-sm space-y-1">
                <li>
                  • <strong>Flexibility:</strong> Write code that works with multiple types
                </li>
                <li>
                  • <strong>Extensibility:</strong> Add new types without changing existing code
                </li>
                <li>
                  • <strong>Abstraction:</strong> Hide implementation details behind interfaces
                </li>
                <li>
                  • <strong>Code Reuse:</strong> Single implementation for multiple behaviors
                </li>
                <li>
                  • <strong>Maintainability:</strong> Changes isolated to specific implementations
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 mb-3">Best Practices</h4>
              <ul className="text-blue-600 text-sm space-y-1">
                <li>• Use interfaces for polymorphic contracts</li>
                <li>• Prefer composition over inheritance when possible</li>
                <li>• Keep inheritance hierarchies shallow</li>
                <li>• Use abstract classes for common behavior</li>
                <li>• Leverage TypeScript's structural typing</li>
                <li>• Document polymorphic behavior clearly</li>
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
          title="Inheritance"
          description="Class hierarchies and code reuse"
          colorScheme="indigo"
          onClick={() => navigateToSection('Inheritance')}
        />
      </ThemeCard>
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
          title="Abstraction"
          description="Abstract classes and interfaces"
          colorScheme="indigo"
          onClick={() => navigateToSection('Abstraction')}
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
        title="Explore Encapsulation"
        description="Learn about data hiding and access control mechanisms"
        buttonText="Next: Encapsulation"
        onButtonClick={() => navigateToSection('Encapsulation')}
        colorScheme="indigo"
      />
    </>
  );
};

export default Polymorphism;
