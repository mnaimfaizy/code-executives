import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import StatsGrid from '../../components/shared/StatsGrid';

const Encapsulation: React.FC = () => {
  const navigateToSection = (section: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('section', section);
    window.history.pushState({}, '', url.toString());
  };

  // Code examples as string constants
  const accessModifiersCode =
    "class BankAccount {\n  // Public: accessible from anywhere\n  public accountNumber: string;\n\n  // Private: only accessible within the class\n  private balance: number;\n\n  // Protected: accessible within class and subclasses\n  protected accountType: string;\n\n  // Readonly: can be set only in constructor\n  readonly readonly owner: string;\n\n  constructor(accountNumber: string, initialBalance: number, owner: string) {\n    this.accountNumber = accountNumber;\n    this.balance = initialBalance;\n    this.owner = owner;\n    this.accountType = 'checking';\n  }\n\n  // Public method to access private data\n  public getBalance(): number {\n    return this.balance;\n  }\n\n  // Public method to modify private data with validation\n  public deposit(amount: number): void {\n    if (amount > 0) {\n      this.balance += amount;\n    }\n  }\n\n  public withdraw(amount: number): boolean {\n    if (amount > 0 && amount <= this.balance) {\n      this.balance -= amount;\n      return true;\n    }\n    return false;\n  }\n\n  // Protected method for subclasses\n  protected getAccountInfo(): string {\n    return `${this.accountType} account for ${this.owner}`;\n  }\n}\n\n// Usage\nconst account = new BankAccount('123456789', 1000, 'John Doe');\nconsole.log(account.accountNumber); // OK - public\n// console.log(account.balance); // Error - private\nconsole.log(account.getBalance()); // OK - through public method\naccount.deposit(500);\nconsole.log(account.getBalance()); // 1500";

  const getterSetterCode =
    "class Person {\n  private _firstName: string;\n  private _lastName: string;\n  private _age: number;\n\n  constructor(firstName: string, lastName: string, age: number) {\n    this._firstName = firstName;\n    this._lastName = lastName;\n    this._age = age;\n  }\n\n  // Getter for fullName\n  get fullName(): string {\n    return `${this._firstName} ${this._lastName}`;\n  }\n\n  // Setter for fullName with validation\n  set fullName(name: string) {\n    const parts = name.trim().split(' ');\n    if (parts.length >= 2) {\n      this._firstName = parts[0];\n      this._lastName = parts.slice(1).join(' ');\n    }\n  }\n\n  // Getter for age\n  get age(): number {\n    return this._age;\n  }\n\n  // Setter for age with validation\n  set age(newAge: number) {\n    if (newAge >= 0 && newAge <= 150) {\n      this._age = newAge;\n    } else {\n      throw new Error('Invalid age');\n    }\n  }\n\n  // Read-only property\n  get isAdult(): boolean {\n    return this._age >= 18;\n  }\n}\n\n// Usage\nconst person = new Person('John', 'Doe', 25);\nconsole.log(person.fullName); // \"John Doe\"\nperson.fullName = 'Jane Smith';\nconsole.log(person.fullName); // \"Jane Smith\"\n\nconsole.log(person.age); // 25\nperson.age = 30;\nconsole.log(person.age); // 30\n\nconsole.log(person.isAdult); // true\n// person.isAdult = false; // Error - read-only";

  const encapsulationPatternsCode =
    "// Module pattern with closures\nclass Counter {\n  private count: number = 0;\n  private readonly maxValue: number;\n\n  constructor(maxValue: number = 100) {\n    this.maxValue = maxValue;\n  }\n\n  public increment(): number {\n    if (this.count < this.maxValue) {\n      this.count++;\n    }\n    return this.count;\n  }\n\n  public decrement(): number {\n    if (this.count > 0) {\n      this.count--;\n    }\n    return this.count;\n  }\n\n  public getValue(): number {\n    return this.count;\n  }\n\n  public reset(): void {\n    this.count = 0;\n  }\n}\n\n// Factory pattern with encapsulation\nclass CarFactory {\n  private static instance: CarFactory;\n  private carsProduced: number = 0;\n\n  private constructor() {}\n\n  public static getInstance(): CarFactory {\n    if (!CarFactory.instance) {\n      CarFactory.instance = new CarFactory();\n    }\n    return CarFactory.instance;\n  }\n\n  public createCar(model: string, color: string): Car {\n    this.carsProduced++;\n    return new Car(model, color, this.carsProduced);\n  }\n\n  public getProductionCount(): number {\n    return this.carsProduced;\n  }\n}\n\nclass Car {\n  public readonly id: number;\n  public readonly model: string;\n  private _color: string;\n\n  constructor(model: string, color: string, id: number) {\n    this.model = model;\n    this._color = color;\n    this.id = id;\n  }\n\n  get color(): string {\n    return this._color;\n  }\n\n  set color(newColor: string) {\n    // Validation logic\n    if (newColor && newColor.trim().length > 0) {\n      this._color = newColor.trim();\n    }\n  }\n}\n\n// Usage\nconst factory = CarFactory.getInstance();\nconst car1 = factory.createCar('Tesla Model 3', 'Red');\nconst car2 = factory.createCar('BMW i3', 'Blue');\nconsole.log(factory.getProductionCount()); // 2";

  const dataValidationCode =
    "class Email {\n  private _value: string;\n\n  constructor(email: string) {\n    this.value = email; // Uses setter validation\n  }\n\n  get value(): string {\n    return this._value;\n  }\n\n  set value(email: string) {\n    if (!this.isValidEmail(email)) {\n      throw new Error('Invalid email format');\n    }\n    this._value = email.toLowerCase().trim();\n  }\n\n  private isValidEmail(email: string): boolean {\n    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n    return emailRegex.test(email);\n  }\n\n  public getDomain(): string {\n    return this._value.split('@')[1];\n  }\n\n  public getUsername(): string {\n    return this._value.split('@')[0];\n  }\n}\n\nclass User {\n  public readonly id: string;\n  private _email: Email;\n  private _passwordHash: string;\n\n  constructor(id: string, email: string, password: string) {\n    this.id = id;\n    this._email = new Email(email);\n    this._passwordHash = this.hashPassword(password);\n  }\n\n  get email(): Email {\n    return this._email;\n  }\n\n  set email(newEmail: Email) {\n    this._email = newEmail;\n  }\n\n  public changePassword(currentPassword: string, newPassword: string): boolean {\n    if (this.verifyPassword(currentPassword)) {\n      this._passwordHash = this.hashPassword(newPassword);\n      return true;\n    }\n    return false;\n  }\n\n  private hashPassword(password: string): string {\n    // In real app, use proper hashing like bcrypt\n    return 'hashed_' + password;\n  }\n\n  private verifyPassword(password: string): boolean {\n    return this._passwordHash === this.hashPassword(password);\n  }\n\n  public getPublicProfile(): { id: string; email: string } {\n    return {\n      id: this.id,\n      email: this._email.value\n    };\n  }\n}\n\n// Usage\ntry {\n  const user = new User('123', 'john@example.com', 'password123');\n  console.log(user.getPublicProfile());\n  user.email = new Email('john.doe@example.com');\n  console.log(user.email.getDomain()); // example.com\n} catch (error) {\n  console.error(error.message);\n}";

  const immutableEncapsulationCode =
    "// Immutable data structures\nclass ImmutablePoint {\n  public readonly x: number;\n  public readonly y: number;\n\n  constructor(x: number, y: number) {\n    this.x = x;\n    this.y = y;\n  }\n\n  // Return new instance instead of modifying\n  public move(dx: number, dy: number): ImmutablePoint {\n    return new ImmutablePoint(this.x + dx, this.y + dy);\n  }\n\n  public distanceTo(other: ImmutablePoint): number {\n    const dx = this.x - other.x;\n    const dy = this.y - other.y;\n    return Math.sqrt(dx * dx + dy * dy);\n  }\n\n  public toString(): string {\n    return `(${this.x}, ${this.y})`;\n  }\n}\n\n// Configuration object with validation\nclass DatabaseConfig {\n  public readonly host: string;\n  public readonly port: number;\n  public readonly database: string;\n  public readonly username: string;\n  private readonly _password: string;\n\n  constructor(config: {\n    host: string;\n    port: number;\n    database: string;\n    username: string;\n    password: string;\n  }) {\n    this.validateConfig(config);\n    this.host = config.host;\n    this.port = config.port;\n    this.database = config.database;\n    this.username = config.username;\n    this._password = config.password;\n  }\n\n  private validateConfig(config: any): void {\n    if (!config.host || typeof config.host !== 'string') {\n      throw new Error('Invalid host');\n    }\n    if (!config.port || config.port < 1 || config.port > 65535) {\n      throw new Error('Invalid port');\n    }\n    if (!config.database || typeof config.database !== 'string') {\n      throw new Error('Invalid database');\n    }\n    if (!config.username || typeof config.username !== 'string') {\n      throw new Error('Invalid username');\n    }\n    if (!config.password || typeof config.password !== 'string') {\n      throw new Error('Invalid password');\n    }\n  }\n\n  public getConnectionString(): string {\n    return `${this.username}:${this._password}@${this.host}:${this.port}/${this.database}`;\n  }\n\n  // No setter for password - it's encapsulated\n  public changePassword(newPassword: string): DatabaseConfig {\n    return new DatabaseConfig({\n      host: this.host,\n      port: this.port,\n      database: this.database,\n      username: this.username,\n      password: newPassword\n    });\n  }\n}\n\n// Usage\nconst point1 = new ImmutablePoint(0, 0);\nconst point2 = point1.move(3, 4);\nconsole.log(point1.toString()); // \"(0, 0)\"\nconsole.log(point2.toString()); // \"(3, 4)\"\nconsole.log(point1.distanceTo(point2)); // 5";

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Encapsulation</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Encapsulation is the bundling of data and methods that operate on that data within a
          single unit, hiding internal implementation details.
        </p>
      </div>
      <StatsGrid
        stats={[
          { label: 'Data Hiding', value: 'Protect internal state' },
          { label: 'Access Control', value: 'Public, private, protected' },
          { label: 'Validation', value: 'Controlled data modification' },
          { label: 'Abstraction', value: 'Hide complexity' },
        ]}
        colorScheme="indigo"
      />
    </div>
  );

  const mainContent = (
    <>
      {/* Access Modifiers */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Access Modifiers</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">
              Public, Private, Protected
            </h3>
            <pre className="bg-gray-900 text-indigo-400 p-4 rounded-lg text-sm overflow-x-auto">
              {accessModifiersCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-600 mb-3">Getters and Setters</h3>
            <pre className="bg-gray-900 text-purple-400 p-4 rounded-lg text-sm overflow-x-auto">
              {getterSetterCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Encapsulation Patterns */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Encapsulation Patterns</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-3">Module Pattern & Factories</h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {encapsulationPatternsCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-3">Data Validation</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
              {dataValidationCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Immutable Encapsulation */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Immutable Encapsulation</h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">
              Immutable Objects & Configuration
            </h3>
            <pre className="bg-gray-900 text-indigo-400 p-4 rounded-lg text-sm overflow-x-auto">
              {immutableEncapsulationCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Benefits and Best Practices */}
      <ThemeCard>
        <div className="p-6 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            Encapsulation Benefits & Best Practices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-700 mb-3">Benefits</h4>
              <ul className="text-green-600 text-sm space-y-1">
                <li>
                  • <strong>Data Protection:</strong> Prevents unauthorized access
                </li>
                <li>
                  • <strong>Modularity:</strong> Changes isolated to class internals
                </li>
                <li>
                  • <strong>Validation:</strong> Ensures data integrity
                </li>
                <li>
                  • <strong>Abstraction:</strong> Hides implementation complexity
                </li>
                <li>
                  • <strong>Maintainability:</strong> Easier to modify internal logic
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-700 mb-3">Best Practices</h4>
              <ul className="text-green-600 text-sm space-y-1">
                <li>• Use private for internal data and methods</li>
                <li>• Provide public getters/setters for controlled access</li>
                <li>• Validate data in setters</li>
                <li>• Use readonly for immutable properties</li>
                <li>• Prefer immutable objects when possible</li>
                <li>• Document public API clearly</li>
                <li>• Keep encapsulation boundaries clear</li>
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
          title="Generics"
          description="Type-safe reusable components"
          colorScheme="indigo"
          onClick={() => navigateToSection('Generics')}
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
        description="Learn about type-safe generic programming"
        buttonText="Next: Generics"
        onButtonClick={() => navigateToSection('Generics')}
        colorScheme="indigo"
      />
    </>
  );
};

export default Encapsulation;
