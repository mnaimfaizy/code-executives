import type { PlaygroundLanguage, VisualizationLens } from '../types';

export interface ExampleSnippet {
  id: string;
  label: string;
  description: string;
  language: PlaygroundLanguage;
  suggestedLens: VisualizationLens;
  code: string;
}

export const exampleSnippets: ExampleSnippet[] = [
  {
    id: 'event-loop-demo',
    label: 'Event Loop Demo',
    description: 'Async execution order with setTimeout and Promises',
    language: 'javascript',
    suggestedLens: 'event-loop',
    code: `// Event Loop Demo
// Watch how tasks are scheduled in the event loop

console.log("1 — Synchronous (main script)");

setTimeout(() => {
  console.log("4 — Macrotask (setTimeout)");
}, 0);

Promise.resolve()
  .then(() => {
    console.log("2 — Microtask (Promise.then)");
  })
  .then(() => {
    console.log("3 — Microtask (chained .then)");
  });

console.log("1.5 — Synchronous (still main script)");
`,
  },
  {
    id: 'binary-search-tree',
    label: 'Binary Search Tree',
    description: 'BST insertion and in-order traversal',
    language: 'javascript',
    suggestedLens: 'data-structure',
    code: `// Binary Search Tree
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

function insert(root, val) {
  if (!root) return new TreeNode(val);
  if (val < root.val) root.left = insert(root.left, val);
  else root.right = insert(root.right, val);
  return root;
}

function inorder(node, result = []) {
  if (!node) return result;
  inorder(node.left, result);
  result.push(node.val);
  inorder(node.right, result);
  return result;
}

let root = null;
const values = [5, 3, 7, 1, 4, 6, 8];
for (const v of values) {
  root = insert(root, v);
  console.log("Inserted:", v);
}

console.log("In-order:", inorder(root));
`,
  },
  {
    id: 'promise-chain',
    label: 'Promise Chain',
    description: 'Promise chaining with error handling',
    language: 'typescript',
    suggestedLens: 'event-loop',
    code: `// Promise Chain with Error Handling

function fetchUser(id: number): Promise<{ name: string; age: number }> {
  return Promise.resolve({ name: "Alice", age: 30 });
}

function validateAge(user: { name: string; age: number }): Promise<string> {
  if (user.age < 18) {
    return Promise.reject(new Error("User is underage"));
  }
  return Promise.resolve(\`\${user.name} is \${user.age} years old\`);
}

console.log("Starting fetch...");

fetchUser(1)
  .then((user) => {
    console.log("Got user:", user.name);
    return validateAge(user);
  })
  .then((message) => {
    console.log("Validated:", message);
  })
  .catch((err) => {
    console.error("Error:", err.message);
  })
  .finally(() => {
    console.log("Done!");
  });
`,
  },
  {
    id: 'array-sort',
    label: 'Bubble Sort',
    description: 'Step-by-step bubble sort visualization',
    language: 'javascript',
    suggestedLens: 'data-structure',
    code: `// Bubble Sort — step by step
const arr = [64, 34, 25, 12, 22, 11, 90];
console.log("Initial:", [...arr]);

for (let i = 0; i < arr.length - 1; i++) {
  for (let j = 0; j < arr.length - i - 1; j++) {
    if (arr[j] > arr[j + 1]) {
      // Swap
      const temp = arr[j];
      arr[j] = arr[j + 1];
      arr[j + 1] = temp;
      console.log(\`Swap [\${j}]↔[\${j+1}]:\`, [...arr]);
    }
  }
  console.log(\`Pass \${i + 1} done:\`, [...arr]);
}

console.log("Sorted:", arr);
`,
  },
  {
    id: 'closure-demo',
    label: 'Closures & Scope',
    description: 'How closures capture variables',
    language: 'javascript',
    suggestedLens: 'heap-stack',
    code: `// Closures & Scope
function makeCounter(start) {
  let count = start;
  return {
    increment() {
      count++;
      console.log("Count:", count);
      return count;
    },
    getCount() {
      return count;
    }
  };
}

const counter1 = makeCounter(0);
const counter2 = makeCounter(10);

counter1.increment(); // 1
counter1.increment(); // 2
counter2.increment(); // 11

console.log("Counter 1:", counter1.getCount());
console.log("Counter 2:", counter2.getCount());
`,
  },
  {
    id: 'python-data-structures',
    label: 'Python Collections',
    description: 'Lists, dicts, and comprehensions',
    language: 'python',
    suggestedLens: 'data-structure',
    code: `# Python Collections
# Lists, dictionaries, and comprehensions

# List operations
fruits = ["apple", "banana", "cherry"]
fruits.append("date")
fruits.insert(1, "avocado")
print("Fruits:", fruits)

# Dictionary
scores = {"Alice": 95, "Bob": 87, "Charlie": 92}
scores["Diana"] = 88
print("Scores:", scores)

# List comprehension
evens = [x for x in range(20) if x % 2 == 0]
print("Evens:", evens)

# Dict comprehension
squared = {x: x**2 for x in range(1, 6)}
print("Squared:", squared)

# Nested structures
matrix = [[i * 3 + j + 1 for j in range(3)] for i in range(3)]
for row in matrix:
    print(row)
`,
  },
  {
    id: 'linked-list',
    label: 'Linked List',
    description: 'Singly linked list with insertion and traversal',
    language: 'javascript',
    suggestedLens: 'data-structure',
    code: `// Singly Linked List
class ListNode {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

function buildList(values) {
  const dummy = new ListNode(0);
  let current = dummy;
  for (const v of values) {
    current.next = new ListNode(v);
    current = current.next;
  }
  return dummy.next;
}

function printList(head) {
  const parts = [];
  let node = head;
  while (node) {
    parts.push(node.val);
    node = node.next;
  }
  console.log(parts.join(" → "));
}

function reverseList(head) {
  let prev = null;
  let current = head;
  while (current) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
    console.log("Reversing step...");
  }
  return prev;
}

const list = buildList([1, 2, 3, 4, 5]);
console.log("Original:");
printList(list);

const reversed = reverseList(list);
console.log("Reversed:");
printList(reversed);
`,
  },
];
