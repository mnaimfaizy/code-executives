import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import PythonCodeBlock from '../shared/PythonCodeBlock';
import ErrorHandling2D from '../visualizations/2d/ErrorHandling2D';

const TRY_EXCEPT_CODE = `# try / except / else / finally — The Full Pattern
def safe_divide(a: float, b: float) -> float | None:
    try:
        result = a / b
    except ZeroDivisionError:
        print("Error: Cannot divide by zero")
        return None
    except TypeError as e:
        print(f"Type error: {e}")
        return None
    else:
        # Runs ONLY if no exception occurred
        print(f"{a} / {b} = {result}")
        return result
    finally:
        # ALWAYS runs — cleanup, logging, etc.
        print("Division operation completed")

# Multiple exception types
def parse_config(data: dict) -> str:
    try:
        name = data["user"]["name"].strip()
        age = int(data["user"]["age"])
    except KeyError as e:
        raise ValueError(f"Missing config key: {e}") from e
    except (TypeError, AttributeError) as e:
        raise ValueError(f"Invalid config format: {e}") from e
    return f"{name} (age {age})"

# EAFP vs LBYL
# LBYL (Look Before You Leap) - Not Pythonic
if "key" in my_dict:
    value = my_dict["key"]

# EAFP (Easier to Ask Forgiveness) - Pythonic!
try:
    value = my_dict["key"]
except KeyError:
    value = "default"

# Even better — use .get()
value = my_dict.get("key", "default")`;

const CONTEXT_MANAGER_CODE = `# Context Managers — Automatic Resource Management
# The "with" statement guarantees cleanup

# File handling (most common use)
with open("data.csv") as f:
    for line in f:
        process(line)
# f.close() is called automatically — even if exception occurs

# Custom context manager with __enter__ / __exit__
class Timer:
    def __enter__(self):
        import time
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        import time
        self.elapsed = time.perf_counter() - self.start
        print(f"Elapsed: {self.elapsed:.4f}s")
        return False  # Don't suppress exceptions

with Timer() as t:
    # Code to time
    result = sum(range(1_000_000))
print(f"Result: {result}, took {t.elapsed:.4f}s")

# Using contextlib for simpler context managers
from contextlib import contextmanager

@contextmanager
def managed_resource(name: str):
    print(f"Acquiring {name}")
    resource = acquire(name)
    try:
        yield resource       # Control returns to 'with' body
    finally:
        print(f"Releasing {name}")
        resource.release()

with managed_resource("database") as db:
    db.query("SELECT * FROM users")`;

const CUSTOM_EXCEPTIONS_CODE = `# Custom Exception Hierarchy — Domain-Specific Errors
class AppError(Exception):
    """Base exception for our application."""
    def __init__(self, message: str, code: int = 500):
        super().__init__(message)
        self.code = code
        self.message = message

class ValidationError(AppError):
    """Raised when input validation fails."""
    def __init__(self, field: str, message: str):
        super().__init__(f"Validation failed for '{field}': {message}", code=400)
        self.field = field

class NotFoundError(AppError):
    """Raised when a resource is not found."""
    def __init__(self, resource: str, identifier: str):
        super().__init__(f"{resource} '{identifier}' not found", code=404)
        self.resource = resource
        self.identifier = identifier

class AuthenticationError(AppError):
    """Raised when authentication fails."""
    def __init__(self, reason: str = "Invalid credentials"):
        super().__init__(reason, code=401)

# Usage in application code
def get_user(user_id: str) -> dict:
    if not user_id:
        raise ValidationError("user_id", "cannot be empty")

    user = database.find_user(user_id)
    if user is None:
        raise NotFoundError("User", user_id)

    return user

# Handling in API layer
try:
    user = get_user(request.user_id)
except ValidationError as e:
    return {"error": e.message, "field": e.field}, e.code
except NotFoundError as e:
    return {"error": e.message}, e.code
except AppError as e:
    return {"error": "Internal error"}, e.code`;

const ADVANCED_CODE = `# Advanced Error Handling Patterns

# 1. Exception Groups (Python 3.11+)
async def fetch_all(urls: list[str]) -> list:
    errors = []
    results = []
    for url in urls:
        try:
            results.append(await fetch(url))
        except Exception as e:
            errors.append(e)
    if errors:
        raise ExceptionGroup("fetch failures", errors)

try:
    data = await fetch_all(urls)
except* ConnectionError as eg:
    print(f"{len(eg.exceptions)} connection errors")
except* TimeoutError as eg:
    print(f"{len(eg.exceptions)} timeouts")

# 2. Retry with exponential backoff
import time

def retry(func, max_attempts=3, base_delay=1.0):
    for attempt in range(max_attempts):
        try:
            return func()
        except Exception as e:
            if attempt == max_attempts - 1:
                raise  # Re-raise on last attempt
            delay = base_delay * (2 ** attempt)
            print(f"Attempt {attempt+1} failed: {e}. Retrying in {delay}s")
            time.sleep(delay)

# 3. Logging exceptions properly
import logging

logger = logging.getLogger(__name__)

try:
    process_data(data)
except Exception:
    logger.exception("Failed to process data")  # Logs full traceback
    raise  # Re-raise after logging`;

const codeExamples = [
  { code: TRY_EXCEPT_CODE, title: 'error_handling.py', highlights: [3, 5, 8, 12, 16, 34] },
  { code: CONTEXT_MANAGER_CODE, title: 'context_managers.py', highlights: [4, 10, 15, 27, 33] },
  { code: CUSTOM_EXCEPTIONS_CODE, title: 'custom_exceptions.py', highlights: [2, 9, 15, 22, 38] },
  { code: ADVANCED_CODE, title: 'advanced_errors.py', highlights: [4, 14, 22, 32, 38] },
];

const ErrorHandling: React.FC = () => {
  const [activeExample, setActiveExample] = React.useState(0);

  const stats = [
    { label: 'Built-in Exceptions', value: '60+', description: 'Python standard library' },
    { label: 'Flow Keywords', value: '5', description: 'try, except, else, finally, raise' },
    {
      label: 'Best Practice',
      value: 'EAFP',
      description: 'Easier to Ask Forgiveness than Permission',
    },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🛡️ Error Handling & Context Managers
        </h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Master Python&apos;s exception system — try/except, context managers, custom exceptions,
          exception chaining, and advanced patterns for robust error handling.
        </p>
      </div>
      <StatsGrid stats={stats} colorScheme="python" />
    </div>
  );

  const mainContent = (
    <div className="space-y-8">
      {/* Interactive Visualization */}
      <ThemeCard className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🔍 Exception Flow Explorer</h2>
        <p className="text-gray-600 mb-4">
          Step through exception hierarchy, try/except flow, context managers, custom exceptions,
          and exception chaining.
        </p>
        <ErrorHandling2D />
      </ThemeCard>

      {/* Code Examples */}
      <ThemeCard className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">💻 Code Examples</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          {['try/except', 'Context Managers', 'Custom Exceptions', 'Advanced'].map((label, i) => (
            <button
              key={label}
              onClick={() => setActiveExample(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeExample === i
                  ? 'bg-red-600 text-white'
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

      {/* EAFP vs LBYL */}
      <ThemeCard className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">⚖️ EAFP vs LBYL</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-bold text-green-800 mb-2">✅ EAFP (Pythonic)</h3>
            <p className="text-sm text-green-700 mb-2">Easier to Ask Forgiveness than Permission</p>
            <code className="text-xs text-green-800 bg-green-100 p-2 rounded block">
              try:
              <br />
              &nbsp;&nbsp;value = data[key]
              <br />
              except KeyError:
              <br />
              &nbsp;&nbsp;value = default
            </code>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h3 className="font-bold text-red-800 mb-2">❌ LBYL (Non-Pythonic)</h3>
            <p className="text-sm text-red-700 mb-2">Look Before You Leap</p>
            <code className="text-xs text-red-800 bg-red-100 p-2 rounded block">
              if key in data:
              <br />
              &nbsp;&nbsp;value = data[key]
              <br />
              else:
              <br />
              &nbsp;&nbsp;value = default
            </code>
          </div>
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
            <li>• Master try/except/else/finally</li>
            <li>• Use context managers (with statement)</li>
            <li>• Create custom exception hierarchies</li>
            <li>• Understand exception chaining</li>
            <li>• Apply EAFP pattern</li>
            <li>• Write @contextmanager decorators</li>
          </ul>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3">⚠️ Common Exceptions</h3>
          <div className="space-y-1 text-xs font-mono text-gray-600">
            {[
              ['ValueError', 'Wrong value type'],
              ['TypeError', 'Wrong argument type'],
              ['KeyError', 'Missing dict key'],
              ['IndexError', 'Index out of range'],
              ['AttributeError', 'Missing attribute'],
              ['FileNotFoundError', "File doesn't exist"],
              ['ImportError', 'Failed import'],
              ['RuntimeError', 'Generic runtime error'],
              ['StopIteration', 'Iterator exhausted'],
              ['ZeroDivisionError', 'Division by zero'],
            ].map(([exc, desc]) => (
              <div key={exc} className="flex justify-between">
                <span className="text-red-600">{exc}</span>
                <span className="text-gray-500">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3">📏 Best Practices</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="text-green-600">✅ Catch specific exceptions</li>
            <li className="text-green-600">✅ Use context managers for cleanup</li>
            <li className="text-green-600">✅ Chain exceptions with &quot;from&quot;</li>
            <li className="text-red-600">❌ Never bare &quot;except:&quot;</li>
            <li className="text-red-600">❌ Don&apos;t silence exceptions</li>
            <li className="text-red-600">❌ Don&apos;t use exceptions for flow control</li>
          </ul>
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

export default ErrorHandling;
