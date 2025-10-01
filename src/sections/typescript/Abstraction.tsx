import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';

const Abstraction: React.FC = () => {
  const navigate = useNavigate();

  const navigateToSection = (sectionName: string) => {
    const encodedSection = encodeURIComponent(sectionName);
    navigate(`/typescript?section=${encodedSection}`);
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Abstraction in TypeScript</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Learn how to hide complex implementation details and expose only essential functionality
          through abstract classes and interfaces
        </p>
      </div>
    </div>
  );

  const mainContent = (
    <>
      {/* What is Abstraction */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">What is Abstraction?</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="p-6 bg-indigo-50 rounded-lg border border-indigo-200">
              <h3 className="text-lg font-semibold text-indigo-800 mb-3">Definition</h3>
              <p className="text-indigo-700 leading-relaxed">
                Abstraction is the process of hiding complex implementation details and showing only
                the essential features of an object to the user.
              </p>
            </div>
          </div>
          <div>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Benefits</h4>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• Reduces complexity</li>
                  <li>• Improves maintainability</li>
                  <li>• Enhances security</li>
                  <li>• Increases reusability</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Real-world Example</h4>
                <p className="text-blue-700 text-sm">
                  A car driver doesn't need to know how the engine works internally - they just need
                  to know how to use the pedals and steering wheel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Abstract Classes */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Abstract Classes</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">Abstract Class Syntax</h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {`abstract class Shape {
  // Abstract property (must be implemented by subclasses)
  abstract name: string;

  // Concrete property
  protected color: string;

  constructor(color: string) {
    this.color = color;
  }

  // Abstract method (must be implemented)
  abstract calculateArea(): number;

  // Concrete method
  getColor(): string {
    return this.color;
  }

  // Abstract method with parameters
  abstract draw(): void;
}

// Cannot instantiate abstract class
// const shape = new Shape("red"); // Error!

class Circle extends Shape {
  name = "Circle";
  radius: number;

  constructor(color: string, radius: number) {
    super(color);
    this.radius = radius;
  }

  calculateArea(): number {
    return Math.PI * this.radius * this.radius;
  }

  draw(): void {
    console.log(\`Drawing a \${this.color} circle\`);
  }
}`}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Abstract Class Rules</h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">Cannot Instantiate</h4>
                <p className="text-red-700 text-sm">
                  Abstract classes cannot be instantiated directly. They must be extended by
                  concrete classes.
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">Abstract Members</h4>
                <p className="text-yellow-700 text-sm">
                  Abstract methods and properties must be implemented by all concrete subclasses.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Concrete Members</h4>
                <p className="text-green-700 text-sm">
                  Concrete methods and properties can be inherited as-is or overridden.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Interfaces */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Interfaces for Abstraction</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">Interface Definition</h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {`interface Drawable {
  // Properties
  readonly id: string;
  color: string;

  // Methods
  draw(): void;
  resize(scale: number): void;
}

interface Movable {
  // Methods
  move(x: number, y: number): void;
  getPosition(): { x: number; y: number };
}

// Multiple interface implementation
class GraphicObject implements Drawable, Movable {
  readonly id: string;
  color: string;
  private x: number = 0;
  private y: number = 0;

  constructor(id: string, color: string) {
    this.id = id;
    this.color = color;
  }

  draw(): void {
    console.log(\`Drawing \${this.color} object at (\${this.x}, \${this.y})\`);
  }

  resize(scale: number): void {
    // Implementation
  }

  move(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}`}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Interface Features</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Multiple Implementation</h4>
                <p className="text-blue-700 text-sm">
                  A class can implement multiple interfaces, unlike single inheritance.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Readonly Properties</h4>
                <p className="text-purple-700 text-sm">
                  Properties can be marked as readonly to prevent modification after initialization.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Optional Members</h4>
                <p className="text-green-700 text-sm">
                  Interface members can be optional using the <code>?</code> operator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Abstract vs Interface */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Abstract Classes vs Interfaces</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                  Feature
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-indigo-600">
                  Abstract Class
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-purple-600">
                  Interface
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-3 font-medium">Instantiation</td>
                <td className="border border-gray-300 px-4 py-3 text-center text-red-600">
                  Cannot instantiate
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center text-red-600">
                  Cannot instantiate
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 font-medium">Implementation</td>
                <td className="border border-gray-300 px-4 py-3 text-center text-green-600">
                  Can have concrete methods
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center text-red-600">
                  Only method signatures
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-3 font-medium">Inheritance</td>
                <td className="border border-gray-300 px-4 py-3 text-center text-yellow-600">
                  Single inheritance
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center text-green-600">
                  Multiple implementation
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 font-medium">Constructors</td>
                <td className="border border-gray-300 px-4 py-3 text-center text-green-600">
                  Can have constructors
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center text-red-600">
                  No constructors
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-3 font-medium">Access Modifiers</td>
                <td className="border border-gray-300 px-4 py-3 text-center text-green-600">
                  All modifiers
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center text-red-600">
                  Public only
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ThemeCard>

      {/* Practical Example */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Example: Payment System</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">
              Abstract Payment Processor
            </h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {`abstract class PaymentProcessor {
  protected amount: number;
  protected currency: string;

  constructor(amount: number, currency: string = 'USD') {
    this.amount = amount;
    this.currency = currency;
  }

  // Abstract method - must be implemented
  abstract processPayment(): Promise<boolean>;

  // Abstract method - must be implemented
  abstract validatePayment(): boolean;

  // Concrete method - inherited as-is
  getAmount(): number {
    return this.amount;
  }

  // Concrete method - can be overridden
  formatAmount(): string {
    return \`\${this.currency} \${this.amount.toFixed(2)}\`;
  }
}`}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-600 mb-3">Payment Interface</h3>
            <pre className="bg-gray-900 text-purple-400 p-4 rounded-lg text-sm overflow-x-auto">
              {`interface Refundable {
  processRefund(amount: number): Promise<boolean>;
}

interface Verifiable {
  verifyTransaction(transactionId: string): Promise<boolean>;
}

// Concrete implementation
class CreditCardProcessor extends PaymentProcessor implements Refundable, Verifiable {
  private cardNumber: string;

  constructor(amount: number, cardNumber: string) {
    super(amount);
    this.cardNumber = cardNumber;
  }

  async processPayment(): Promise<boolean> {
    // Implementation details hidden
    console.log(\`Processing \${this.formatAmount()} with card\`);
    return true;
  }

  validatePayment(): boolean {
    // Validation logic hidden
    return this.cardNumber.length === 16;
  }

  async processRefund(amount: number): Promise<boolean> {
    console.log(\`Refunding \${amount} from credit card\`);
    return true;
  }

  async verifyTransaction(transactionId: string): Promise<boolean> {
    console.log(\`Verifying transaction \${transactionId}\`);
    return true;
  }
}`}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Usage Example */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Usage Example</h2>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
          {`// Client code only sees the abstraction
const processor: PaymentProcessor & Refundable & Verifiable =
  new CreditCardProcessor(100, "1234567890123456");

// Use the public interface
console.log(processor.getAmount());        // 100
console.log(processor.formatAmount());     // "USD 100.00"

if (processor.validatePayment()) {
  const success = await processor.processPayment();
  console.log(\`Payment \${success ? 'successful' : 'failed'}\`);

  // Refund functionality
  await processor.processRefund(50);

  // Verification functionality
  await processor.verifyTransaction("txn_123");
}

// Implementation details are completely hidden!
// No access to cardNumber, internal validation logic, etc.`}
        </pre>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <>
      <ThemeCard>
        <NavigationCard
          title="Encapsulation"
          description="Learn data hiding principles"
          colorScheme="indigo"
          onClick={() => navigateToSection('Encapsulation')}
        />
      </ThemeCard>
      <ThemeCard>
        <NavigationCard
          title="SOLID Principles"
          description="Object-oriented design principles"
          colorScheme="indigo"
          onClick={() => navigateToSection('SOLID Principles')}
        />
      </ThemeCard>
      <ThemeCard>
        <NavigationCard
          title="Visualizations"
          description="Interactive abstraction demos"
          colorScheme="indigo"
          onClick={() => navigateToSection('TypeScript Visualization')}
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
        description="Learn how to protect object internals while exposing necessary functionality"
        buttonText="Next: Encapsulation"
        onButtonClick={() => navigateToSection('Encapsulation')}
        colorScheme="indigo"
      />
    </>
  );
};

export default Abstraction;
