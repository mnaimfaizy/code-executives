import type { PlaygroundLanguage } from '../types';

/** Default starter code templates for each supported language */
export const codeTemplates: Record<PlaygroundLanguage, string> = {
  javascript: `// JavaScript Playground
// Try editing this code and click Run!

function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return name.toUpperCase();
}

const result = greet("World");
console.log("Result:", result);

// Async example
setTimeout(() => {
  console.log("This runs after the timeout");
}, 1000);

Promise.resolve().then(() => {
  console.log("This runs as a microtask");
});

console.log("This runs synchronously");
`,

  typescript: `// TypeScript Playground
// Full type checking and IntelliSense support!

interface User {
  name: string;
  age: number;
  email: string;
}

function createUser(name: string, age: number, email: string): User {
  return { name, age, email };
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}! You are \${user.age} years old.\`;
}

const user = createUser("Alice", 30, "alice@example.com");
console.log(greetUser(user));

// Generic example
function identity<T>(value: T): T {
  console.log("Type:", typeof value);
  return value;
}

console.log(identity<number>(42));
console.log(identity<string>("hello"));
`,

  python: `# Python Playground
# Powered by Pyodide (CPython in the browser)

def greet(name: str) -> str:
    """Greet someone by name."""
    message = f"Hello, {name}!"
    print(message)
    return name.upper()

result = greet("World")
print(f"Result: {result}")

# Data structures example
numbers = [3, 1, 4, 1, 5, 9, 2, 6, 5]
sorted_numbers = sorted(numbers)
print(f"Sorted: {sorted_numbers}")

# List comprehension
squares = [x ** 2 for x in range(10)]
print(f"Squares: {squares}")
`,
};

/** Get the default code template for a given language */
export function getDefaultTemplate(language: PlaygroundLanguage): string {
  return codeTemplates[language];
}
