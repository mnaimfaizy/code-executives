import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import PythonCodeBlock from '../shared/PythonCodeBlock';
import Comprehensions2D from '../visualizations/2d/Comprehensions2D';

const COMPREHENSIONS_CODE = `# List, Dict, Set Comprehensions — Pythonic Data Transforms

# List comprehension
squares = [x**2 for x in range(10)]
# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# With filtering
evens = [x for x in range(20) if x % 2 == 0]
# [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

# Nested comprehension — flatten matrix
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [num for row in matrix for num in row]
# [1, 2, 3, 4, 5, 6, 7, 8, 9]

# Conditional expression (ternary)
labels = ["even" if x % 2 == 0 else "odd" for x in range(5)]
# ["even", "odd", "even", "odd", "even"]

# Dict comprehension
word_lengths = {word: len(word) for word in ["hello", "world", "python"]}
# {"hello": 5, "world": 5, "python": 6}

# Invert a dictionary
original = {"a": 1, "b": 2, "c": 3}
inverted = {v: k for k, v in original.items()}
# {1: "a", 2: "b", 3: "c"}

# Set comprehension — remove duplicates
sentence = "the quick brown fox jumps over the lazy dog"
unique_lengths = {len(word) for word in sentence.split()}
# {3, 4, 5}`;

const FUNCTIONAL_CODE = `# Functional Programming — lambda, map, filter, reduce

# Lambda — anonymous functions
square = lambda x: x ** 2
add = lambda a, b: a + b

# Sorting with key function
students = [("Alice", 90), ("Bob", 85), ("Charlie", 92)]
by_grade = sorted(students, key=lambda s: s[1], reverse=True)
# [("Charlie", 92), ("Alice", 90), ("Bob", 85)]

# map() — transform every element
names = ["alice", "bob", "charlie"]
capitalized = list(map(str.upper, names))
# ["ALICE", "BOB", "CHARLIE"]

# filter() — keep elements that match condition
numbers = [1, -2, 3, -4, 5, -6]
positives = list(filter(lambda x: x > 0, numbers))
# [1, 3, 5]

# reduce() — accumulate a single result
from functools import reduce
total = reduce(lambda acc, x: acc + x, [1, 2, 3, 4, 5])
# 15 (((((1+2)+3)+4)+5))

# Comprehension equivalents (usually preferred)
# map:    [f(x) for x in iterable]
# filter: [x for x in iterable if condition(x)]

# When to use functional vs comprehension:
# - Simple transforms → comprehension (more readable)
# - Existing function → map/filter (e.g., map(str.upper, names))
# - Complex chaining → neither (use explicit loops)`;

const GENERATORS_CODE = `# Generators — Lazy Iterators for Memory Efficiency

# Generator function (uses yield instead of return)
def fibonacci(limit: int):
    a, b = 0, 1
    while a < limit:
        yield a       # Pauses here, resumes on next()
        a, b = b, a + b

# Usage — only computes values on demand
for num in fibonacci(100):
    print(num, end=" ")
# 0 1 1 2 3 5 8 13 21 34 55 89

# Generator expression (like list comp but with ())
squares = (x**2 for x in range(1_000_000))
# No memory allocated for 1M items!

# Take first 5
from itertools import islice
first_five = list(islice(squares, 5))
# [0, 1, 4, 9, 16]

# Real-world: processing large files
def read_large_file(path: str):
    with open(path) as f:
        for line in f:
            yield line.strip()

# Pipeline of generators
def parse_csv(lines):
    for line in lines:
        yield line.split(",")

def filter_rows(rows, column, value):
    for row in rows:
        if row[column] == value:
            yield row

# Compose — processes one line at a time!
lines = read_large_file("huge_data.csv")
rows = parse_csv(lines)
filtered = filter_rows(rows, 0, "active")`;

const ITERTOOLS_CODE = `# itertools — Power Tools for Iteration
from itertools import (
    chain, combinations, permutations,
    product, groupby, accumulate, starmap,
    islice, count, cycle, repeat, zip_longest
)

# chain — combine multiple iterables
combined = list(chain([1, 2], [3, 4], [5]))
# [1, 2, 3, 4, 5]

# combinations — all r-length subsets
combos = list(combinations("ABCD", 2))
# [('A','B'), ('A','C'), ('A','D'), ('B','C'), ('B','D'), ('C','D')]

# product — cartesian product
coords = list(product(range(3), range(3)))
# [(0,0), (0,1), (0,2), (1,0), (1,1), (1,2), (2,0), (2,1), (2,2)]

# groupby — group consecutive elements
data = [("A", 1), ("A", 2), ("B", 3), ("B", 4)]
for key, group in groupby(data, key=lambda x: x[0]):
    print(f"{key}: {list(group)}")
# A: [("A", 1), ("A", 2)]
# B: [("B", 3), ("B", 4)]

# accumulate — running totals
running = list(accumulate([1, 2, 3, 4, 5]))
# [1, 3, 6, 10, 15]

# zip_longest — zip with fill value
names = ["Alice", "Bob"]
scores = [90, 85, 78]
paired = list(zip_longest(names, scores, fillvalue="N/A"))
# [("Alice", 90), ("Bob", 85), ("N/A", 78)]

# Infinite iterators
counter = count(start=10, step=2)  # 10, 12, 14, ...
cycler = cycle(["red", "green", "blue"])  # repeats forever`;

const codeExamples = [
  { code: COMPREHENSIONS_CODE, title: 'comprehensions.py', highlights: [3, 7, 11, 15, 20, 25, 30] },
  { code: FUNCTIONAL_CODE, title: 'functional.py', highlights: [3, 8, 13, 18, 23] },
  { code: GENERATORS_CODE, title: 'generators.py', highlights: [4, 6, 14, 23, 31, 37] },
  { code: ITERTOOLS_CODE, title: 'itertools_examples.py', highlights: [8, 12, 16, 21, 27, 31] },
];

const Comprehensions: React.FC = () => {
  const [activeExample, setActiveExample] = React.useState(0);

  const stats = [
    { label: 'Comprehension Types', value: '4', description: 'List, Dict, Set, Generator' },
    {
      label: 'Functional Built-ins',
      value: '5',
      description: 'map, filter, reduce, zip, enumerate',
    },
    {
      label: 'itertools Functions',
      value: '20+',
      description: 'Combinatoric + infinite iterators',
    },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🔄 Comprehensions & Functional Programming
        </h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Master Python&apos;s most powerful patterns — comprehensions, generators, lambda,
          map/filter/reduce, and the itertools toolkit for elegant data processing.
        </p>
      </div>
      <StatsGrid stats={stats} colorScheme="python" />
    </div>
  );

  const mainContent = (
    <div className="space-y-8">
      {/* Interactive Visualization */}
      <ThemeCard className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🔍 Comprehension Pipeline</h2>
        <p className="text-gray-600 mb-4">
          Watch how comprehensions transform data: input → filter → transform → result.
        </p>
        <Comprehensions2D />
      </ThemeCard>

      {/* Code Examples */}
      <ThemeCard className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">💻 Code Examples</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          {['Comprehensions', 'Functional', 'Generators', 'itertools'].map((label, i) => (
            <button
              key={label}
              onClick={() => setActiveExample(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeExample === i
                  ? 'bg-blue-600 text-white'
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

      {/* Comprehension Cheat Sheet */}
      <ThemeCard className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Comprehension Cheat Sheet</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              type: 'List',
              syntax: '[expr for x in iterable if cond]',
              example: '[x**2 for x in range(5)]',
              result: '[0, 1, 4, 9, 16]',
              color: 'blue',
            },
            {
              type: 'Dict',
              syntax: '{k: v for x in iterable if cond}',
              example: '{x: x**2 for x in range(5)}',
              result: '{0:0, 1:1, 2:4, 3:9, 4:16}',
              color: 'purple',
            },
            {
              type: 'Set',
              syntax: '{expr for x in iterable if cond}',
              example: '{x % 3 for x in range(10)}',
              result: '{0, 1, 2}',
              color: 'red',
            },
            {
              type: 'Generator',
              syntax: '(expr for x in iterable if cond)',
              example: 'sum(x**2 for x in range(5))',
              result: '30 (lazy)',
              color: 'green',
            },
          ].map((item) => (
            <div
              key={item.type}
              className={`p-3 bg-${item.color}-50 rounded-lg border border-${item.color}-100`}
            >
              <h4 className={`font-bold text-${item.color}-800 mb-1`}>{item.type}</h4>
              <code className="text-xs text-gray-600 block mb-1">{item.syntax}</code>
              <code className={`text-xs text-${item.color}-700 block`}>{item.example}</code>
              <code className={`text-xs text-${item.color}-600 block mt-1`}>→ {item.result}</code>
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
            <li>• Write list, dict, and set comprehensions</li>
            <li>• Use generator expressions for memory efficiency</li>
            <li>• Apply lambda, map, filter, reduce</li>
            <li>• Chain generators for data pipelines</li>
            <li>• Use itertools for combinatoric operations</li>
          </ul>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3">⚡ When to Use</h3>
          <div className="space-y-2 text-sm">
            <div className="p-2 bg-blue-50 rounded border border-blue-100">
              <span className="font-semibold text-blue-800">Comprehension</span>
              <p className="text-blue-600 text-xs mt-1">
                Simple transforms & filters. Most readable.
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded border border-green-100">
              <span className="font-semibold text-green-800">Generator</span>
              <p className="text-green-600 text-xs mt-1">
                Large data, pipelines, streaming. Memory efficient.
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded border border-purple-100">
              <span className="font-semibold text-purple-800">map/filter</span>
              <p className="text-purple-600 text-xs mt-1">
                When you already have a named function.
              </p>
            </div>
            <div className="p-2 bg-gray-50 rounded border border-gray-100">
              <span className="font-semibold text-gray-800">Explicit loop</span>
              <p className="text-gray-600 text-xs mt-1">
                Complex logic, side effects, readability.
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3">📏 Performance</h3>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>List comp</span>
              <span className="font-mono text-blue-600">~30% faster than loop</span>
            </div>
            <div className="flex justify-between">
              <span>Generator</span>
              <span className="font-mono text-green-600">O(1) memory</span>
            </div>
            <div className="flex justify-between">
              <span>map()</span>
              <span className="font-mono text-purple-600">Similar to comp</span>
            </div>
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

export default Comprehensions;
