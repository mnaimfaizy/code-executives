import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import PythonCodeBlock from '../shared/PythonCodeBlock';
import OOPVisualization2D from '../visualizations/2d/OOPVisualization2D';

const CLASSES_CODE = `# Python Classes - Blueprints for Objects
class BankAccount:
    """A simple bank account with deposit/withdraw."""

    # Class variable (shared by all instances)
    bank_name = "PyBank"

    def __init__(self, owner: str, balance: float = 0):
        # Instance variables (unique to each object)
        self.owner = owner
        self._balance = balance    # Convention: _ = "internal"
        self._transactions: list[float] = []

    @property
    def balance(self) -> float:
        """Read-only property for balance."""
        return self._balance

    def deposit(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("Amount must be positive")
        self._balance += amount
        self._transactions.append(amount)

    def withdraw(self, amount: float) -> None:
        if amount > self._balance:
            raise ValueError("Insufficient funds")
        self._balance -= amount
        self._transactions.append(-amount)

    def __repr__(self) -> str:
        return f"BankAccount({self.owner!r}, balance={self._balance})"

# Usage
acct = BankAccount("Alice", 1000)
acct.deposit(500)
acct.withdraw(200)
print(acct.balance)   # 1300
print(acct)           # BankAccount('Alice', balance=1300)`;

const INHERITANCE_CODE = `# Inheritance and Polymorphism
from abc import ABC, abstractmethod

class Shape(ABC):
    """Abstract base class - cannot be instantiated."""

    @abstractmethod
    def area(self) -> float:
        pass

    @abstractmethod
    def perimeter(self) -> float:
        pass

    def describe(self) -> str:
        return f"{self.__class__.__name__}: area={self.area():.2f}"

class Circle(Shape):
    def __init__(self, radius: float):
        self.radius = radius

    def area(self) -> float:
        return 3.14159 * self.radius ** 2

    def perimeter(self) -> float:
        return 2 * 3.14159 * self.radius

class Rectangle(Shape):
    def __init__(self, width: float, height: float):
        self.width = width
        self.height = height

    def area(self) -> float:
        return self.width * self.height

    def perimeter(self) -> float:
        return 2 * (self.width + self.height)

# Polymorphism - same interface, different behavior
shapes: list[Shape] = [Circle(5), Rectangle(4, 6)]
for shape in shapes:
    print(shape.describe())
# Circle: area=78.54
# Rectangle: area=24.00`;

const DUNDER_CODE = `# Magic Methods - Customize Python Operators
class Matrix:
    def __init__(self, data: list[list[float]]):
        self.data = data
        self.rows = len(data)
        self.cols = len(data[0]) if data else 0

    def __repr__(self) -> str:
        rows = ["  " + str(row) for row in self.data]
        return f"Matrix([\\n{'\\n'.join(rows)}\\n])"

    def __getitem__(self, pos: tuple[int, int]) -> float:
        row, col = pos
        return self.data[row][col]

    def __add__(self, other: "Matrix") -> "Matrix":
        return Matrix([
            [self[i, j] + other[i, j] for j in range(self.cols)]
            for i in range(self.rows)
        ])

    def __mul__(self, scalar: float) -> "Matrix":
        return Matrix([
            [self[i, j] * scalar for j in range(self.cols)]
            for i in range(self.rows)
        ])

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Matrix):
            return NotImplemented
        return self.data == other.data

    def __len__(self) -> int:
        return self.rows * self.cols

m1 = Matrix([[1, 2], [3, 4]])
m2 = Matrix([[5, 6], [7, 8]])
print(m1 + m2)     # Matrix([[6, 8], [10, 12]])
print(m1 * 2)      # Matrix([[2, 4], [6, 8]])
print(m1[0, 1])    # 2`;

const DATACLASS_CODE = `# Dataclasses - Modern Python OOP (3.7+)
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime

@dataclass
class Task:
    title: str
    priority: int = 0
    completed: bool = False
    tags: list[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)

    @property
    def is_urgent(self) -> bool:
        return self.priority >= 8

    def complete(self) -> None:
        self.completed = True

@dataclass(frozen=True)  # Immutable dataclass
class Point:
    x: float
    y: float

    def distance_to(self, other: "Point") -> float:
        return ((self.x - other.x)**2 + (self.y - other.y)**2) ** 0.5

# Auto-generates __init__, __repr__, __eq__
task = Task("Learn Python", priority=9, tags=["python", "learning"])
print(task)            # Task(title='Learn Python', priority=9, ...)
print(task.is_urgent)  # True

p1 = Point(0, 0)
p2 = Point(3, 4)
print(p1.distance_to(p2))  # 5.0
# p1.x = 10  # FrozenInstanceError! (immutable)`;

const codeExamples = [
  { code: CLASSES_CODE, title: 'classes.py', highlights: [5, 7, 13, 14, 16] },
  { code: INHERITANCE_CODE, title: 'inheritance.py', highlights: [3, 6, 16, 34] },
  { code: DUNDER_CODE, title: 'magic_methods.py', highlights: [7, 10, 13, 19, 27] },
  { code: DATACLASS_CODE, title: 'dataclasses.py', highlights: [6, 20, 28] },
];

const OOP: React.FC = () => {
  const [activeExample, setActiveExample] = React.useState(0);

  const stats = [
    {
      label: 'OOP Pillars',
      value: '4',
      description: 'Encapsulation, Inheritance, Polymorphism, Abstraction',
    },
    { label: 'Magic Methods', value: '100+', description: 'Dunder methods for customization' },
    { label: 'Dataclasses', value: '3.7+', description: 'Modern OOP with less boilerplate' },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🏗️ Object-Oriented Programming</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Master Python&apos;s OOP system — classes, inheritance, magic methods, abstract classes,
          method resolution order, properties, and modern dataclasses.
        </p>
      </div>
      <StatsGrid stats={stats} colorScheme="python" />
    </div>
  );

  const mainContent = (
    <div className="space-y-8">
      {/* Interactive Visualization */}
      <ThemeCard className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🔍 Class Hierarchy Explorer</h2>
        <p className="text-gray-600 mb-4">
          Step through OOP concepts: class definitions, inheritance chains, MRO, magic methods, and
          dataclasses.
        </p>
        <OOPVisualization2D />
      </ThemeCard>

      {/* Code Examples */}
      <ThemeCard className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">💻 Code Examples</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          {['Classes', 'Inheritance', 'Magic Methods', 'Dataclasses'].map((label, i) => (
            <button
              key={label}
              onClick={() => setActiveExample(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeExample === i
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <PythonCodeBlock
          code={codeExamples[activeExample].code}
          title={codeExamples[activeExample].title}
          highlightLines={codeExamples[activeExample].highlights}
          maxHeight="32rem"
        />
      </ThemeCard>

      {/* Pillars of OOP */}
      <ThemeCard className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🏛️ Four Pillars of OOP</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'Encapsulation',
              color: 'blue',
              icon: '🔒',
              desc: 'Bundle data and methods together. Use _private convention and @property for controlled access.',
            },
            {
              title: 'Inheritance',
              color: 'green',
              icon: '🌳',
              desc: 'Create specialized classes from general ones. Share common code via parent classes.',
            },
            {
              title: 'Polymorphism',
              color: 'purple',
              icon: '🎭',
              desc: 'Same interface, different behavior. Use duck typing — "if it quacks like a duck..."',
            },
            {
              title: 'Abstraction',
              color: 'amber',
              icon: '📐',
              desc: 'Define interfaces with ABC. Hide implementation details, expose only what matters.',
            },
          ].map((pillar) => (
            <div
              key={pillar.title}
              className={`p-4 bg-${pillar.color}-50 rounded-lg border border-${pillar.color}-100`}
            >
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span>{pillar.icon}</span>
                {pillar.title}
              </h3>
              <p className="text-sm text-gray-600 mt-2">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </ThemeCard>
    </div>
  );

  const sidebarContent = (
    <>
      <ThemeCard>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3">🎯 Learning Objectives</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Define classes with __init__ and methods</li>
            <li>• Use inheritance and super()</li>
            <li>• Understand Method Resolution Order</li>
            <li>• Implement magic methods</li>
            <li>• Use @property and @staticmethod</li>
            <li>• Leverage dataclasses for clean code</li>
            <li>• Apply abstract base classes (ABC)</li>
          </ul>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3">🔑 Key Magic Methods</h3>
          <div className="space-y-1 text-xs font-mono text-gray-600">
            {[
              ['__init__', 'Constructor'],
              ['__repr__', 'String representation'],
              ['__str__', 'User-friendly string'],
              ['__len__', 'len() support'],
              ['__getitem__', '[] indexing'],
              ['__iter__', 'for loop support'],
              ['__add__', '+ operator'],
              ['__eq__', '== comparison'],
              ['__hash__', 'Hash for dicts/sets'],
              ['__enter__/__exit__', 'with statement'],
            ].map(([method, desc]) => (
              <div key={method} className="flex justify-between">
                <span className="text-purple-600">{method}</span>
                <span className="text-gray-500">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </ThemeCard>
    </>
  );

  return (
    <SectionLayout
      section="python"
      hero={heroContent}
      mainContent={mainContent}
      sidebar={sidebarContent}
    />
  );
};

export default OOP;
