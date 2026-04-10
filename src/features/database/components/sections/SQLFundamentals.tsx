import React, { useState } from 'react';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { Code, Database, Plus, Search, Trash2, Edit3 } from 'lucide-react';

interface SQLExample {
  category: string;
  title: string;
  description: string;
  sql: string;
  explanation: string;
  icon: React.ReactNode;
}

const examples: SQLExample[] = [
  {
    category: 'CREATE',
    title: 'Create Table',
    description: 'Define a new table with constraints',
    sql: `CREATE TABLE employees (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(255) UNIQUE,
  salary    DECIMAL(10,2) CHECK (salary > 0),
  dept_id   INTEGER REFERENCES departments(id),
  hired_at  TIMESTAMP DEFAULT NOW()
);`,
    explanation:
      'Creates a table with primary key, uniqueness, check constraints, and a foreign key relationship. SERIAL auto-generates IDs.',
    icon: <Plus className="w-5 h-5 text-emerald-600" />,
  },
  {
    category: 'READ',
    title: 'JOIN Query',
    description: 'Combine data from multiple tables',
    sql: `SELECT e.name, d.name AS department, e.salary
FROM employees e
INNER JOIN departments d ON e.dept_id = d.id
WHERE e.salary > 75000
ORDER BY e.salary DESC
LIMIT 10;`,
    explanation:
      'INNER JOIN combines rows only when matches exist. WHERE filters after the join. ORDER BY sorts descending. LIMIT caps output.',
    icon: <Search className="w-5 h-5 text-blue-600" />,
  },
  {
    category: 'READ',
    title: 'Aggregation & Grouping',
    description: 'Summarize data with GROUP BY',
    sql: `SELECT d.name AS department,
       COUNT(*)       AS headcount,
       AVG(e.salary)  AS avg_salary,
       MAX(e.salary)  AS top_salary
FROM employees e
JOIN departments d ON e.dept_id = d.id
GROUP BY d.name
HAVING COUNT(*) >= 5
ORDER BY avg_salary DESC;`,
    explanation:
      'GROUP BY collapses rows by department. Aggregate functions compute per-group. HAVING filters groups (unlike WHERE which filters rows).',
    icon: <Database className="w-5 h-5 text-purple-600" />,
  },
  {
    category: 'UPDATE',
    title: 'Update with Subquery',
    description: 'Modify rows using a correlated subquery',
    sql: `UPDATE employees
SET salary = salary * 1.10
WHERE dept_id IN (
  SELECT id FROM departments
  WHERE name = 'Engineering'
)
AND hired_at < '2023-01-01';`,
    explanation:
      'Gives a 10% raise to Engineering employees hired before 2023. The subquery finds the department ID dynamically.',
    icon: <Edit3 className="w-5 h-5 text-amber-600" />,
  },
  {
    category: 'DELETE',
    title: 'Safe Delete with CTE',
    description: 'Delete rows using a Common Table Expression',
    sql: `WITH inactive AS (
  SELECT id FROM employees
  WHERE last_login < NOW() - INTERVAL '2 years'
    AND status = 'inactive'
)
DELETE FROM employees
WHERE id IN (SELECT id FROM inactive);`,
    explanation:
      'CTEs (WITH) make complex deletes readable and auditable. The query first identifies targets, then deletes. Safer than a direct DELETE with complex WHERE.',
    icon: <Trash2 className="w-5 h-5 text-red-600" />,
  },
  {
    category: 'READ',
    title: 'Window Functions',
    description: 'Analytical queries without collapsing rows',
    sql: `SELECT name, department, salary,
  RANK() OVER (
    PARTITION BY department
    ORDER BY salary DESC
  ) AS salary_rank,
  salary - AVG(salary) OVER (
    PARTITION BY department
  ) AS diff_from_avg
FROM employees;`,
    explanation:
      'Window functions compute per-row analytics without GROUP BY. PARTITION BY creates windows per department. Each row keeps its identity.',
    icon: <Code className="w-5 h-5 text-teal-600" />,
  },
];

const SQLFundamentals: React.FC = () => {
  const [activeExample, setActiveExample] = useState(0);
  const categories = ['All', 'CREATE', 'READ', 'UPDATE', 'DELETE'];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredExamples =
    activeCategory === 'All' ? examples : examples.filter((e) => e.category === activeCategory);

  return (
    <div className="space-y-6">
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-teal-100 p-3 rounded-full">
            <Code className="w-8 h-8 text-teal-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SQL Fundamentals</h1>
            <p className="text-gray-600">The language every database speaks</p>
          </div>
        </div>

        <p className="text-gray-700 mb-6 leading-relaxed">
          SQL (Structured Query Language) is the universal language for interacting with relational
          databases. Unlike imperative programming languages, SQL is <strong>declarative</strong> —
          you specify <em>what</em> data you want, not <em>how</em> to get it. The DBMS query
          optimizer decides the most efficient execution strategy.
        </p>

        {/* CRUD Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setActiveExample(0);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Example Cards */}
        <div className="space-y-4">
          {filteredExamples.map((example, idx) => (
            <div
              key={idx}
              className={`rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                activeExample === idx
                  ? 'border-teal-400 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setActiveExample(idx)}
            >
              <div className="p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  {example.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-teal-600">
                      {example.category}
                    </span>
                    <h3 className="font-semibold text-gray-900">{example.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{example.description}</p>
                </div>
              </div>

              {activeExample === idx && (
                <div className="border-t border-gray-100">
                  <div className="bg-gray-900 p-4 font-mono text-sm overflow-x-auto">
                    <pre className="text-green-400 whitespace-pre">{example.sql}</pre>
                  </div>
                  <div className="p-4 bg-teal-50">
                    <p className="text-sm text-gray-700">
                      <strong className="text-teal-800">How it works:</strong> {example.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* SQL vs NoSQL Query Comparison */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">SQL vs NoSQL Query Styles</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">SQL (PostgreSQL)</h3>
            <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs overflow-x-auto">
              <pre className="text-blue-300">{`SELECT name, email
FROM users
WHERE age > 25
  AND city = 'NYC'
ORDER BY name;`}</pre>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-orange-800 mb-2">NoSQL (MongoDB)</h3>
            <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs overflow-x-auto">
              <pre className="text-orange-300">{`db.users.find(
  { age: { $gt: 25 }, city: "NYC" },
  { name: 1, email: 1 }
).sort({ name: 1 });`}</pre>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          SQL uses a standardized, declarative syntax across all relational databases. NoSQL
          databases each have their own query APIs — MongoDB uses JSON-like query documents.
        </p>
      </ThemeCard>
    </div>
  );
};

export default SQLFundamentals;
