import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import PythonCodeBlock from '../shared/PythonCodeBlock';
import DataStructures2D from '../visualizations/2d/DataStructures2D';

const LISTS_CODE = `# Python Lists - Ordered, Mutable Sequences
fruits = ["apple", "banana", "cherry"]

# Append - O(1) amortized
fruits.append("date")

# Insert at index - O(n)
fruits.insert(1, "grape")

# List comprehension - Pythonic way to create lists
squares = [x**2 for x in range(10)]
# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# Nested comprehension
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [num for row in matrix for num in row]
# [1, 2, 3, 4, 5, 6, 7, 8, 9]

# Filtering with comprehension
evens = [x for x in range(20) if x % 2 == 0]

# Slicing - list[start:stop:step]
first_three = fruits[:3]
reversed_list = fruits[::-1]
every_other = fruits[::2]`;

const DICTS_CODE = `# Python Dictionaries - Hash Maps with O(1) Lookup
person = {
    "name": "Alice",
    "age": 30,
    "skills": ["Python", "ML", "Data Science"]
}

# Access with .get() for safe defaults
email = person.get("email", "not provided")

# Dictionary comprehension
word = "abracadabra"
freq = {ch: word.count(ch) for ch in set(word)}
# {'a': 5, 'b': 2, 'r': 2, 'c': 1, 'd': 1}

# Merging dicts (Python 3.9+)
defaults = {"theme": "dark", "lang": "en"}
overrides = {"lang": "fr", "font": 14}
config = defaults | overrides
# {"theme": "dark", "lang": "fr", "font": 14}

# Unpacking
for key, value in person.items():
    print(f"{key}: {value}")

# defaultdict for automatic defaults
from collections import defaultdict
counter = defaultdict(int)
for ch in "mississippi":
    counter[ch] += 1`;

const SETS_CODE = `# Python Sets - Unordered, Unique Elements
primes = {2, 3, 5, 7, 11, 13}
evens = {2, 4, 6, 8, 10, 12}

# Set operations (mathematical)
common = primes & evens        # {2} - intersection
all_nums = primes | evens      # union
only_primes = primes - evens   # {3, 5, 7, 11, 13}
symmetric = primes ^ evens     # in one but not both

# Fast membership testing - O(1)
print(7 in primes)   # True
print(4 in primes)   # False

# Remove duplicates from a list
items = [1, 2, 2, 3, 3, 3, 4]
unique = list(set(items))  # [1, 2, 3, 4]

# Frozen sets (immutable, hashable)
fs = frozenset([1, 2, 3])
# Can be used as dict keys or set elements`;

const TUPLES_CODE = `# Python Tuples - Immutable Sequences
point = (3, 4)
rgb = (255, 128, 0)

# Tuple unpacking (destructuring)
x, y = point
r, g, b = rgb

# Extended unpacking with *
first, *middle, last = [1, 2, 3, 4, 5]
# first=1, middle=[2,3,4], last=5

# Named tuples for readable code
from collections import namedtuple

Point = namedtuple("Point", ["x", "y"])
Color = namedtuple("Color", ["r", "g", "b"])

p = Point(3, 4)
print(p.x, p.y)       # 3 4
print(p._asdict())     # {'x': 3, 'y': 4}

# Tuples as dict keys (hashable)
grid = {}
grid[(0, 0)] = "origin"
grid[(1, 2)] = "point A"

# Swap variables (tuple packing/unpacking)
a, b = 1, 2
a, b = b, a  # a=2, b=1`;

const codeExamples = [
  { code: LISTS_CODE, title: 'lists.py', highlights: [2, 5, 8, 12, 16] },
  { code: DICTS_CODE, title: 'dicts.py', highlights: [2, 10, 17, 23] },
  { code: SETS_CODE, title: 'sets.py', highlights: [5, 6, 7, 8, 11, 16] },
  { code: TUPLES_CODE, title: 'tuples.py', highlights: [6, 7, 10, 16, 20] },
];

const CoreDataStructures: React.FC = () => {
  const [activeExample, setActiveExample] = React.useState(0);

  const stats = [
    { label: 'Data Structures', value: '4', description: 'list, dict, set, tuple' },
    { label: 'Operations', value: '20+', description: 'CRUD, iteration, comprehension' },
    { label: 'Avg Lookup', value: 'O(1)', description: 'Dict & Set hash-based' },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">📦 Python Core Data Structures</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Master Python&apos;s built-in data structures — lists, dictionaries, sets, and tuples.
          Understand their time complexity, internal implementation, and when to use each one.
        </p>
      </div>
      <StatsGrid stats={stats} colorScheme="python" />
    </div>
  );

  const mainContent = (
    <div className="space-y-8">
      {/* Interactive Visualization */}
      <ThemeCard className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🔍 Interactive Data Structure Explorer
        </h2>
        <p className="text-gray-600 mb-4">
          Switch between data structures and step through operations to see how they work
          internally.
        </p>
        <DataStructures2D />
      </ThemeCard>

      {/* Code Examples */}
      <ThemeCard className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">💻 Code Examples</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          {['Lists', 'Dictionaries', 'Sets', 'Tuples'].map((label, i) => (
            <button
              key={label}
              onClick={() => setActiveExample(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeExample === i
                  ? 'bg-indigo-600 text-white'
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

      {/* Complexity Comparison */}
      <ThemeCard className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">⚡ Time Complexity Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Operation</th>
                <th className="px-4 py-3 text-center font-semibold text-blue-700">List</th>
                <th className="px-4 py-3 text-center font-semibold text-purple-700">Dict</th>
                <th className="px-4 py-3 text-center font-semibold text-red-700">Set</th>
                <th className="px-4 py-3 text-center font-semibold text-green-700">Tuple</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ['Access by index', 'O(1)', '—', '—', 'O(1)'],
                ['Search / "in"', 'O(n)', 'O(1)', 'O(1)', 'O(n)'],
                ['Insert / Add', 'O(n)', 'O(1)', 'O(1)', '—'],
                ['Append', 'O(1)*', '—', '—', '—'],
                ['Delete', 'O(n)', 'O(1)', 'O(1)', '—'],
                ['Iteration', 'O(n)', 'O(n)', 'O(n)', 'O(n)'],
                ['Sort', 'O(n log n)', '—', '—', '—'],
              ].map(([op, list, dict, set, tuple], i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-700">{op}</td>
                  <td className="px-4 py-2 text-center font-mono text-blue-600">{list}</td>
                  <td className="px-4 py-2 text-center font-mono text-purple-600">{dict}</td>
                  <td className="px-4 py-2 text-center font-mono text-red-600">{set}</td>
                  <td className="px-4 py-2 text-center font-mono text-green-600">{tuple}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          * O(1) amortized — occasional O(n) when resizing
        </p>
      </ThemeCard>
    </div>
  );

  const sidebarContent = (
    <>
      <ThemeCard>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3">🎯 Learning Objectives</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Understand Python&apos;s 4 core data structures</li>
            <li>• Know when to use each structure</li>
            <li>• Master list and dict comprehensions</li>
            <li>• Understand time complexity trade-offs</li>
            <li>• Use sets for efficient membership testing</li>
          </ul>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3">📊 When to Use What</h3>
          <div className="space-y-3 text-sm">
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
              <span className="font-semibold text-blue-800">List</span>
              <p className="text-blue-600 mt-1">
                Ordered collection, need index access, duplicates OK
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
              <span className="font-semibold text-purple-800">Dict</span>
              <p className="text-purple-600 mt-1">Key-value mapping, fast lookup by key</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg border border-red-100">
              <span className="font-semibold text-red-800">Set</span>
              <p className="text-red-600 mt-1">
                Unique elements, membership testing, math operations
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg border border-green-100">
              <span className="font-semibold text-green-800">Tuple</span>
              <p className="text-green-600 mt-1">Immutable record, function returns, dict keys</p>
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

export default CoreDataStructures;
