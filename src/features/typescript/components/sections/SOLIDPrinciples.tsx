import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import StatsGrid from '../../../../components/shared/StatsGrid';
import TypeScriptCodeBlock from '../shared/TypeScriptCodeBlock';

interface Principle {
  letter: string;
  name: string;
  tagline: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badCode: string;
  goodCode: string;
  badTitle: string;
  goodTitle: string;
  explanation: string;
}

const PRINCIPLES: Principle[] = [
  {
    letter: 'S',
    name: 'Single Responsibility',
    tagline: 'A class should have only one reason to change',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badTitle: 'violation.ts',
    badCode: `class UserService {
  createUser(data: UserData): User {
    // validates input
    // hashes password
    // saves to DB
    // sends welcome email
    // logs analytics event
    return user;
  }
}`,
    goodTitle: 'refactored.ts',
    goodCode: `class UserRepository {
  save(user: User): void { /* DB only */ }
}

class PasswordHasher {
  hash(password: string): string { /* hashing only */ }
}

class EmailService {
  sendWelcome(user: User): void { /* email only */ }
}

class CreateUserUseCase {
  constructor(
    private repo: UserRepository,
    private hasher: PasswordHasher,
    private email: EmailService,
  ) {}

  execute(data: UserData): User {
    const hashed = this.hasher.hash(data.password);
    const user = new User(data.name, hashed);
    this.repo.save(user);
    this.email.sendWelcome(user);
    return user;
  }
}`,
    explanation:
      "Each class handles one concern. Changes to email logic don't touch the database layer.",
  },
  {
    letter: 'O',
    name: 'Open / Closed',
    tagline: 'Open for extension, closed for modification',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    badTitle: 'violation.ts',
    badCode: `class AreaCalculator {
  calculate(shape: Shape): number {
    if (shape.type === "circle") {
      return Math.PI * shape.radius ** 2;
    } else if (shape.type === "square") {
      return shape.side ** 2;
    }
    // Must modify this class for every new shape!
    throw new Error("Unknown shape");
  }
}`,
    goodTitle: 'refactored.ts',
    goodCode: `interface Shape {
  area(): number;
}

class Circle implements Shape {
  constructor(private radius: number) {}
  area(): number { return Math.PI * this.radius ** 2; }
}

class Square implements Shape {
  constructor(private side: number) {}
  area(): number { return this.side ** 2; }
}

// Adding a new shape requires NO changes to existing code
class Triangle implements Shape {
  constructor(private base: number, private height: number) {}
  area(): number { return 0.5 * this.base * this.height; }
}

function totalArea(shapes: Shape[]): number {
  return shapes.reduce((sum, s) => sum + s.area(), 0);
}`,
    explanation: 'New shapes are added by creating new classes — existing code stays untouched.',
  },
  {
    letter: 'L',
    name: 'Liskov Substitution',
    tagline: 'Subtypes must be substitutable for their base types',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    badTitle: 'violation.ts',
    badCode: `class Rectangle {
  constructor(
    protected width: number,
    protected height: number,
  ) {}

  setWidth(w: number) { this.width = w; }
  setHeight(h: number) { this.height = h; }
  area(): number { return this.width * this.height; }
}

class Square extends Rectangle {
  setWidth(w: number) {
    this.width = w;
    this.height = w; // breaks expectations!
  }
  setHeight(h: number) {
    this.width = h;
    this.height = h;
  }
}`,
    goodTitle: 'refactored.ts',
    goodCode: `interface Shape {
  area(): number;
}

class Rectangle implements Shape {
  constructor(
    readonly width: number,
    readonly height: number,
  ) {}
  area(): number { return this.width * this.height; }
}

class Square implements Shape {
  constructor(readonly side: number) {}
  area(): number { return this.side ** 2; }
}

// Both can be used anywhere a Shape is expected
function printArea(shape: Shape): void {
  console.log(\`Area: \${shape.area()}\`);
}`,
    explanation:
      'Square and Rectangle are siblings, not parent/child. Both honour the Shape contract.',
  },
  {
    letter: 'I',
    name: 'Interface Segregation',
    tagline: "Clients should not depend on interfaces they don't use",
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    badTitle: 'violation.ts',
    badCode: `interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  attendMeeting(): void;
}

// A Robot can't eat or sleep!
class Robot implements Worker {
  work() { /* ok */ }
  eat() { throw new Error("Robots don't eat"); }
  sleep() { throw new Error("Robots don't sleep"); }
  attendMeeting() { /* ok */ }
}`,
    goodTitle: 'refactored.ts',
    goodCode: `interface Workable {
  work(): void;
}

interface Feedable {
  eat(): void;
}

interface Sleepable {
  sleep(): void;
}

interface Meetable {
  attendMeeting(): void;
}

class Human implements Workable, Feedable, Sleepable, Meetable {
  work() { /* ... */ }
  eat() { /* ... */ }
  sleep() { /* ... */ }
  attendMeeting() { /* ... */ }
}

class Robot implements Workable, Meetable {
  work() { /* ... */ }
  attendMeeting() { /* ... */ }
}`,
    explanation: 'Small, focused interfaces let each class implement only what it actually needs.',
  },
  {
    letter: 'D',
    name: 'Dependency Inversion',
    tagline: 'Depend on abstractions, not concretions',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badTitle: 'violation.ts',
    badCode: `class MySQLDatabase {
  save(data: string): void { /* ... */ }
}

class UserService {
  private db = new MySQLDatabase(); // tight coupling!

  createUser(name: string): void {
    this.db.save(name);
  }
}

// Switching to PostgreSQL requires rewriting UserService`,
    goodTitle: 'refactored.ts',
    goodCode: `interface Database {
  save(data: string): void;
}

class MySQLDatabase implements Database {
  save(data: string): void { /* MySQL logic */ }
}

class PostgresDatabase implements Database {
  save(data: string): void { /* Postgres logic */ }
}

class UserService {
  constructor(private db: Database) {} // depends on abstraction

  createUser(name: string): void {
    this.db.save(name);
  }
}

// Easy to swap implementations
const service = new UserService(new PostgresDatabase());`,
    explanation:
      'UserService depends on the Database interface. Concrete implementations can be swapped freely.',
  },
];

const SOLIDPrinciples: React.FC = () => {
  const navigate = useNavigate();
  const [activePrinciple, setActivePrinciple] = useState(0);

  const navigateToSection = (sectionName: string): void => {
    const encodedSection = encodeURIComponent(sectionName);
    navigate(`/typescript?section=${encodedSection}`);
  };

  const p = PRINCIPLES[activePrinciple];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">SOLID Principles</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Five design principles that lead to maintainable, extensible object-oriented code
        </p>
      </div>
      <StatsGrid
        stats={[
          { value: '5', label: 'Core principles' },
          { value: 'OOP', label: 'Foundation for clean design' },
          { value: 'TypeScript', label: 'Enforced via types & interfaces' },
        ]}
        colorScheme="indigo"
      />
    </div>
  );

  const mainContent = (
    <>
      {/* Principle Selector */}
      <ThemeCard>
        <div className="flex flex-wrap gap-2 mb-6">
          {PRINCIPLES.map((pr, i) => (
            <button
              key={pr.letter}
              onClick={() => setActivePrinciple(i)}
              className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activePrinciple === i
                  ? `${pr.bgColor} ${pr.color} ${pr.borderColor} border-2 shadow-sm`
                  : 'bg-gray-100 text-gray-500 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              <span className="text-lg mr-1.5">{pr.letter}</span>
              <span className="hidden sm:inline">{pr.name}</span>
            </button>
          ))}
        </div>

        {/* Active principle header */}
        <div className={`${p.bgColor} ${p.borderColor} border rounded-xl p-5 mb-6`}>
          <h2 className={`text-2xl font-bold ${p.color} mb-1`}>
            {p.letter} — {p.name}
          </h2>
          <p className="text-gray-700 italic">&ldquo;{p.tagline}&rdquo;</p>
        </div>

        {/* Bad vs Good code comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xs font-bold">
                ✗
              </span>
              <span className="text-sm font-semibold text-red-700">Violation</span>
            </div>
            <TypeScriptCodeBlock code={p.badCode} title={p.badTitle} maxHeight="18rem" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">
                ✓
              </span>
              <span className="text-sm font-semibold text-green-700">Refactored</span>
            </div>
            <TypeScriptCodeBlock code={p.goodCode} title={p.goodTitle} maxHeight="18rem" />
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-4 bg-indigo-50 rounded-xl p-4 border border-indigo-100">
          <p className="text-sm text-indigo-800">
            <strong>💡 Why it matters:</strong> {p.explanation}
          </p>
        </div>
      </ThemeCard>

      {/* Quick summary grid */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">At a Glance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {PRINCIPLES.map((pr) => (
            <div
              key={pr.letter}
              className={`${pr.bgColor} ${pr.borderColor} border rounded-xl p-4 text-center`}
            >
              <div className={`text-3xl font-black ${pr.color} mb-1`}>{pr.letter}</div>
              <div className="text-xs font-semibold text-gray-700">{pr.name}</div>
            </div>
          ))}
        </div>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Related Topics</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Classes & Objects"
            description="TypeScript class fundamentals"
            colorScheme="indigo"
            onClick={() => navigateToSection('Classes & Objects')}
          />
          <NavigationCard
            title="Abstraction"
            description="Abstract classes and interfaces"
            colorScheme="indigo"
            onClick={() => navigateToSection('Abstraction')}
          />
          <NavigationCard
            title="Best Practices"
            description="TypeScript coding guidelines"
            colorScheme="indigo"
            onClick={() => navigateToSection('Best Practices')}
          />
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-3">SOLID Mnemonic</h3>
        <div className="space-y-2">
          {PRINCIPLES.map((pr) => (
            <div key={pr.letter} className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-lg ${pr.bgColor} ${pr.color} flex items-center justify-center text-sm font-black`}
              >
                {pr.letter}
              </span>
              <span className="text-sm text-gray-700">{pr.name}</span>
            </div>
          ))}
        </div>
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
        title="Apply SOLID in Practice"
        description="See how these principles translate into real TypeScript patterns and best practices."
        buttonText="Next: Best Practices"
        onButtonClick={() => navigateToSection('Best Practices')}
        colorScheme="indigo"
      />
    </>
  );
};

export default SOLIDPrinciples;
