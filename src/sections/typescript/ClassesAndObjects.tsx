import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';

const ClassesAndObjects: React.FC = () => {
  const navigateToSection = (section: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('section', section);
    window.history.pushState({}, '', url.toString());
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Classes & Objects in TypeScript</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Master the fundamentals of object-oriented programming with TypeScript's class-based
          syntax and object instantiation
        </p>
      </div>
    </div>
  );

  const mainContent = (
    <>
      {/* Class Definition */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Class Definition & Structure</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">TypeScript Class Syntax</h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {`class Person {
  // Properties
  public name: string;
  private age: number;
  protected email: string;

  // Constructor
  constructor(name: string, age: number, email: string) {
    this.name = name;
    this.age = age;
    this.email = email;
  }

  // Methods
  public greet(): string {
    return \`Hello, I'm \${this.name}\`;
  }

  private calculateAge(): number {
    return this.age;
  }

  protected getContactInfo(): string {
    return this.email;
  }
}`}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Key Components</h3>
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h4 className="font-semibold text-indigo-800 mb-2">Properties</h4>
                <p className="text-indigo-700 text-sm">
                  Data members that define the state of objects
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Constructor</h4>
                <p className="text-purple-700 text-sm">
                  Special method called when creating new instances
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Methods</h4>
                <p className="text-blue-700 text-sm">
                  Functions that define the behavior of objects
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Access Modifiers */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Access Modifiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-green-50 rounded-lg border border-green-200">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-bold">P</span>
            </div>
            <h3 className="text-lg font-bold text-green-800 mb-2">Public</h3>
            <p className="text-green-700 text-sm mb-3">
              Accessible from anywhere - inside the class, outside the class, and in derived
              classes.
            </p>
            <pre className="bg-green-900 text-green-300 p-2 rounded text-xs">
              {`public name: string;`}
            </pre>
          </div>
          <div className="p-6 bg-red-50 rounded-lg border border-red-200">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-bold">R</span>
            </div>
            <h3 className="text-lg font-bold text-red-800 mb-2">Private</h3>
            <p className="text-red-700 text-sm mb-3">
              Only accessible within the same class. Not accessible in derived classes.
            </p>
            <pre className="bg-red-900 text-red-300 p-2 rounded text-xs">
              {`private age: number;`}
            </pre>
          </div>
          <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-bold">P</span>
            </div>
            <h3 className="text-lg font-bold text-yellow-800 mb-2">Protected</h3>
            <p className="text-yellow-700 text-sm mb-3">
              Accessible within the same class and derived classes, but not from outside.
            </p>
            <pre className="bg-yellow-900 text-yellow-300 p-2 rounded text-xs">
              {`protected email: string;`}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Object Instantiation */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Object Instantiation</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">Creating Objects</h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {`// Create instances of the Person class
const person1 = new Person("Alice", 30, "alice@example.com");
const person2 = new Person("Bob", 25, "bob@example.com");

// Access public properties and methods
console.log(person1.greet()); // "Hello, I'm Alice"
console.log(person2.name);    // "Bob"

// Private and protected members are not accessible
// console.log(person1.age);     // Error!
// console.log(person1.email);   // Error!`}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Object Lifecycle</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Instantiation</h4>
                  <p className="text-gray-600 text-sm">
                    Use the <code>new</code> keyword to create object instances
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Initialization</h4>
                  <p className="text-gray-600 text-sm">
                    Constructor is called to initialize object state
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Usage</h4>
                  <p className="text-gray-600 text-sm">Access public methods and properties</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-white font-bold text-sm">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Cleanup</h4>
                  <p className="text-gray-600 text-sm">
                    Garbage collection handles memory management
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Static Members */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Static Members</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">
              Static Properties & Methods
            </h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {`class MathUtils {
  // Static property
  static PI: number = 3.14159;

  // Static method
  static calculateArea(radius: number): number {
    return this.PI * radius * radius;
  }

  // Instance method
  calculateCircumference(radius: number): number {
    return 2 * MathUtils.PI * radius;
  }
}

// Access static members without instantiation
console.log(MathUtils.PI);                    // 3.14159
console.log(MathUtils.calculateArea(5));      // 78.53975

// Instance methods require an object
const utils = new MathUtils();
console.log(utils.calculateCircumference(5)); // 31.4159`}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">When to Use Static Members</h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-1">Utility Functions</h4>
                <p className="text-gray-600 text-sm">
                  Mathematical operations, string manipulations, etc.
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-1">Constants</h4>
                <p className="text-gray-600 text-sm">
                  Shared values that don't change per instance
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-1">Factory Methods</h4>
                <p className="text-gray-600 text-sm">Methods that create instances of the class</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-1">Singleton Pattern</h4>
                <p className="text-gray-600 text-sm">Ensure only one instance exists</p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Practical Example */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Example: Bank Account</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">BankAccount Class</h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {`class BankAccount {
  // Properties
  public accountNumber: string;
  private balance: number;
  protected accountHolder: string;

  // Static property for interest rate
  static interestRate: number = 0.05;

  constructor(accountNumber: string, holder: string, initialBalance: number = 0) {
    this.accountNumber = accountNumber;
    this.accountHolder = holder;
    this.balance = initialBalance;
  }

  // Public methods
  public deposit(amount: number): void {
    if (amount > 0) {
      this.balance += amount;
    }
  }

  public withdraw(amount: number): boolean {
    if (amount > 0 && amount <= this.balance) {
      this.balance -= amount;
      return true;
    }
    return false;
  }

  public getBalance(): number {
    return this.balance;
  }

  // Static method
  static calculateInterest(balance: number): number {
    return balance * this.interestRate;
  }
}`}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Usage Example</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
              {`// Create account
const account = new BankAccount("123456", "John Doe", 1000);

// Use public methods
account.deposit(500);
console.log(account.getBalance()); // 1500

account.withdraw(200);
console.log(account.getBalance()); // 1300

// Access public property
console.log(account.accountNumber); // "123456"

// Use static method
const interest = BankAccount.calculateInterest(1300);
console.log(\`Interest: \${interest}\`); // "Interest: 65"

// Private/protected members not accessible
// console.log(account.balance);      // Error!
// console.log(account.accountHolder); // Error!`}
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
          title="Inheritance"
          description="Learn about class inheritance"
          colorScheme="indigo"
          onClick={() => navigateToSection('Inheritance')}
        />
      </ThemeCard>
      <ThemeCard>
        <NavigationCard
          title="Polymorphism"
          description="Understand method overriding"
          colorScheme="indigo"
          onClick={() => navigateToSection('Polymorphism')}
        />
      </ThemeCard>
      <ThemeCard>
        <NavigationCard
          title="Encapsulation"
          description="Learn about data hiding"
          colorScheme="indigo"
          onClick={() => navigateToSection('Encapsulation')}
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
        title="Explore Inheritance"
        description="Learn how classes can inherit properties and methods from other classes"
        buttonText="Next: Inheritance"
        onButtonClick={() => navigateToSection('Inheritance')}
        colorScheme="indigo"
      />
    </>
  );
};

export default ClassesAndObjects;
