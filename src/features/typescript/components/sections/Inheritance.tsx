import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import StatsGrid from '../../../../components/shared/StatsGrid';

const Inheritance: React.FC = () => {
  const navigateToSection = (section: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('section', section);
    window.history.pushState({}, '', url.toString());
  };

  // Code examples as string constants
  const basicInheritanceCode =
    "class Animal {\n  name: string;\n  age: number;\n\n  constructor(name: string, age: number) {\n    this.name = name;\n    this.age = age;\n  }\n\n  eat(): void {\n    console.log(this.name + ' is eating');\n  }\n\n  sleep(): void {\n    console.log(this.name + ' is sleeping');\n  }\n}\n\nclass Dog extends Animal {\n  breed: string;\n\n  constructor(name: string, age: number, breed: string) {\n    super(name, age); // Call parent constructor\n    this.breed = breed;\n  }\n\n  // Override parent method\n  eat(): void {\n    console.log(this.name + ' is eating dog food');\n  }\n\n  // Add new method\n  bark(): void {\n    console.log('Woof!');\n  }\n}\n\n// Usage\nconst dog = new Dog('Buddy', 3, 'Golden Retriever');\ndog.eat();  // \"Buddy is eating dog food\"\ndog.sleep(); // \"Buddy is sleeping\" (inherited)\ndog.bark(); // \"Woof!\"";

  const methodOverridingCode =
    "class Vehicle {\n  speed: number;\n\n  constructor(speed: number = 0) {\n    this.speed = speed;\n  }\n\n  accelerate(amount: number): void {\n    this.speed += amount;\n    console.log('Speed is now ' + this.speed + ' km/h');\n  }\n\n  getDescription(): string {\n    return 'A vehicle moving at ' + this.speed + ' km/h';\n  }\n}\n\nclass Car extends Vehicle {\n  fuelLevel: number;\n\n  constructor(speed: number = 0, fuelLevel: number = 100) {\n    super(speed);\n    this.fuelLevel = fuelLevel;\n  }\n\n  // Override accelerate to consume fuel\n  accelerate(amount: number): void {\n    if (this.fuelLevel > 0) {\n      super.accelerate(amount); // Call parent method\n      this.fuelLevel -= amount * 0.1; // Consume fuel\n      console.log('Fuel level: ' + this.fuelLevel.toFixed(1) + '%');\n    } else {\n      console.log('Out of fuel!');\n    }\n  }\n\n  // Override description\n  getDescription(): string {\n    return super.getDescription() + ' with ' + this.fuelLevel.toFixed(1) + '% fuel';\n  }\n}\n\n// Usage\nconst car = new Car(50, 80);\ncar.accelerate(20); // Speed: 70, Fuel: 78.0%\nconsole.log(car.getDescription());";

  const superKeywordCode =
    'class Shape {\n  x: number;\n  y: number;\n\n  constructor(x: number = 0, y: number = 0) {\n    this.x = x;\n    this.y = y;\n  }\n\n  move(dx: number, dy: number): void {\n    this.x += dx;\n    this.y += dy;\n  }\n\n  getPosition(): string {\n    return `(${this.x}, ${this.y})`;\n  }\n}\n\nclass Circle extends Shape {\n  radius: number;\n\n  constructor(x: number, y: number, radius: number) {\n    super(x, y); // Must call super() first\n    this.radius = radius;\n  }\n\n  // Override move to add validation\n  move(dx: number, dy: number): void {\n    // Call parent method\n    super.move(dx, dy);\n    // Add circle-specific logic\n    this.validatePosition();\n  }\n\n  private validatePosition(): void {\n    // Ensure circle stays within bounds\n    if (this.x - this.radius < 0) this.x = this.radius;\n    if (this.y - this.radius < 0) this.y = this.radius;\n  }\n\n  getArea(): number {\n    return Math.PI * this.radius * this.radius;\n  }\n}\n\n// Usage\nconst circle = new Circle(10, 10, 5);\ncircle.move(15, 20);\nconsole.log(circle.getPosition()); // "(25, 30)"\nconsole.log(\'Area:\', circle.getArea());';

  const protectedMembersCode =
    "class Employee {\n  public name: string;\n  protected salary: number; // Accessible in derived classes\n  private ssn: string;     // Only accessible in this class\n\n  constructor(name: string, salary: number, ssn: string) {\n    this.name = name;\n    this.salary = salary;\n    this.ssn = ssn;\n  }\n\n  public getDetails(): string {\n    return `${this.name} earns $${this.salary}`;\n  }\n\n  protected calculateBonus(): number {\n    return this.salary * 0.1;\n  }\n}\n\nclass Manager extends Employee {\n  private subordinates: string[];\n\n  constructor(name: string, salary: number, ssn: string, subordinates: string[]) {\n    super(name, salary, ssn);\n    this.subordinates = subordinates;\n  }\n\n  // Can access protected salary and calculateBonus\n  public getManagerDetails(): string {\n    const bonus = this.calculateBonus();\n    return `${this.name} manages ${this.subordinates.length} people. Bonus: $${bonus}`;\n  }\n\n  // Cannot access private ssn\n  // public getSSN(): string { return this.ssn; } // Error!\n}\n\n// Usage\nconst manager = new Manager('Alice', 80000, '123-45-6789', ['Bob', 'Charlie']);\nconsole.log(manager.getDetails()); // Works (public)\nconsole.log(manager.getManagerDetails()); // Works (protected access)";

  const inheritanceVsCompositionCode =
    "// Inheritance approach\nclass Bird {\n  fly(): void {\n    console.log('Flying');\n  }\n}\n\nclass Eagle extends Bird {\n  hunt(): void {\n    console.log('Hunting');\n  }\n}\n\n// What if we want a Penguin that can't fly?\nclass Penguin extends Bird {\n  fly(): void {\n    throw new Error('Penguins cannot fly!');\n  }\n}\n\n// Composition approach\ninterface Flyable {\n  fly(): void;\n}\n\nclass FlyingBehavior implements Flyable {\n  fly(): void {\n    console.log('Flying');\n  }\n}\n\nclass Bird2 {\n  constructor(private flyBehavior?: Flyable) {}\n\n  fly(): void {\n    if (this.flyBehavior) {\n      this.flyBehavior.fly();\n    } else {\n      console.log('Cannot fly');\n    }\n  }\n}\n\nclass Eagle2 extends Bird2 {\n  constructor() {\n    super(new FlyingBehavior());\n  }\n\n  hunt(): void {\n    console.log('Hunting');\n  }\n}\n\nclass Penguin2 extends Bird2 {\n  constructor() {\n    super(); // No flying behavior\n  }\n}\n\n// Usage\nconst eagle = new Eagle2();\neagle.fly(); // \"Flying\"\n\nconst penguin = new Penguin2();\npenguin.fly(); // \"Cannot fly\"";

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Inheritance</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Inheritance allows one class to inherit properties and methods from another class,
          promoting code reuse and establishing hierarchical relationships.
        </p>
      </div>
      <StatsGrid
        stats={[
          { label: 'Code Reuse', value: 'Inherit existing functionality' },
          { label: 'Hierarchy', value: 'Create class relationships' },
          { label: 'Polymorphism', value: 'Override behavior' },
          { label: 'Extensibility', value: 'Build upon base classes' },
        ]}
        colorScheme="indigo"
      />
    </div>
  );

  const mainContent = (
    <>
      {/* Basic Inheritance */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Inheritance</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">Extending Classes</h3>
            <pre className="bg-gray-900 text-indigo-400 p-4 rounded-lg text-sm overflow-x-auto">
              {basicInheritanceCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-600 mb-3">Method Overriding</h3>
            <pre className="bg-gray-900 text-purple-400 p-4 rounded-lg text-sm overflow-x-auto">
              {methodOverridingCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Advanced Inheritance */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Inheritance Patterns</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-3">Using super() Keyword</h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {superKeywordCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-3">Protected Members</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
              {protectedMembersCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Inheritance vs Composition */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Inheritance vs Composition</h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">
              When to Use Each Approach
            </h3>
            <pre className="bg-gray-900 text-indigo-400 p-4 rounded-lg text-sm overflow-x-auto">
              {inheritanceVsCompositionCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Best Practices */}
      <ThemeCard>
        <div className="p-6 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Inheritance Best Practices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">When to Use Inheritance</h4>
              <ul className="text-green-600 text-sm space-y-1">
                <li>• "Is-a" relationships (Dog is an Animal)</li>
                <li>• Shared behavior across subclasses</li>
                <li>• Polymorphic behavior needed</li>
                <li>• Hierarchical domain models</li>
                <li>• Code reuse through inheritance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-700 mb-2">When to Avoid Inheritance</h4>
              <ul className="text-red-600 text-sm space-y-1">
                <li>• "Has-a" relationships (use composition)</li>
                <li>• Multiple inheritance needed</li>
                <li>• Tight coupling between classes</li>
                <li>• Complex inheritance hierarchies</li>
                <li>• When behavior changes frequently</li>
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
          title="Polymorphism"
          description="Method overriding and dynamic dispatch"
          colorScheme="indigo"
          onClick={() => navigateToSection('Polymorphism')}
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
        title="Explore Polymorphism"
        description="Learn about method overriding and dynamic dispatch in TypeScript"
        buttonText="Next: Polymorphism"
        onButtonClick={() => navigateToSection('Polymorphism')}
        colorScheme="indigo"
      />
    </>
  );
};

export default Inheritance;
