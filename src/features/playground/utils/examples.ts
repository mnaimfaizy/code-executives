import type { PlaygroundLanguage, VisualizationLens } from '../types';
// Only code that the site already shows is imported, from pure data modules: an example that is
// a story's program, or a section's sample, is that same string, so the two cannot drift apart.
import { STORY_CODE as EVENT_LOOP_STORY_CODE } from '../../javascript/utils/eventLoopStory';
import { STORY_CODE as GARBAGE_COLLECTION_STORY_CODE } from '../../javascript/utils/garbageCollectionStory';
import { sectionSamples, type SectionSample } from '../../javascript/utils/sectionSamples';
import { STORY_CODE as STACK_HEAP_STORY_CODE } from '../../javascript/utils/stackHeapStory';

/** Where on the site an example's code comes from, and so where its link back leads. */
export interface ExampleSource {
  /** `story`: the example is a story's program. `section`: it is a sample a section shows. */
  kind: 'story' | 'section';
  /** The story's title, or the section's label exactly as the sidebar spells it. */
  label: string;
  /** The section's own path, inside this site. */
  href: string;
}

export interface Example {
  id: string;
  label: string;
  description: string;
  language: PlaygroundLanguage;
  suggestedLens: VisualizationLens;
  code: string;
  /** The story or section this example's code is taken from. Absent for a standalone program. */
  source?: ExampleSource;
}

/** A JavaScript section's path, as `moduleNavigation.ts` builds it (a test holds the two equal). */
const javascriptSectionHref = (label: string): string =>
  `/javascript?section=${encodeURIComponent(label)}`;

/** A section's sample as an example: the same code, its lens, and the way back to the section. */
const fromSection = (sample: SectionSample): Example => ({
  id: sample.example,
  label: `${sample.section}: ${sample.title}`,
  description: sample.description,
  language: 'javascript',
  suggestedLens: sample.lens,
  code: sample.code,
  source: {
    kind: 'section',
    label: sample.section,
    href: javascriptSectionHref(sample.section),
  },
});

/** The label an example shows under a heading that already names its section. */
export const labelWithinSource = (example: Example): string =>
  example.source?.kind === 'section' && example.label.startsWith(`${example.source.label}: `)
    ? example.label.slice(example.source.label.length + 2)
    : example.label;

export const examples: Example[] = [
  {
    id: 'stack-heap-story',
    label: 'Story: Stack ↔ Heap',
    description: 'The program from the Stack ↔ Heap story: who keeps an object alive?',
    language: 'javascript',
    suggestedLens: 'stack-heap',
    code: STACK_HEAP_STORY_CODE,
    source: {
      kind: 'story',
      label: 'Stack ↔ Heap: who keeps an object alive?',
      href: '/javascript?section=Memory%20Heap%20%26%20Objects',
    },
  },
  {
    id: 'event-loop-story',
    label: 'Story: The Event Loop',
    description: 'The program from the Event Loop story: which callback runs next?',
    language: 'javascript',
    suggestedLens: 'stack-queues',
    code: EVENT_LOOP_STORY_CODE,
    source: {
      kind: 'story',
      label: 'The Event Loop: what runs next?',
      href: '/javascript?section=Event%20Loop%20%26%20Coordination',
    },
  },
  {
    id: 'garbage-collection-story',
    label: 'Story: Garbage Collection',
    description: 'The program from the Garbage Collection story: what does the collector free?',
    language: 'javascript',
    suggestedLens: 'stack-heap',
    code: GARBAGE_COLLECTION_STORY_CODE,
    source: {
      kind: 'story',
      label: 'Garbage Collection: what does the collector free?',
      href: '/javascript?section=Garbage%20Collection',
    },
  },
  {
    id: 'binary-search-tree',
    label: 'Binary Search Tree',
    description: 'BST insertion and in-order traversal',
    language: 'javascript',
    suggestedLens: 'stack-heap',
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
    suggestedLens: 'stack-queues',
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
    suggestedLens: 'stack-heap',
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
    suggestedLens: 'stack-heap',
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
    suggestedLens: 'stack-heap',
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
    suggestedLens: 'stack-heap',
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
  // The JavaScript sections' own samples, section by section (`sectionSamples.ts`)
  ...sectionSamples.map(fromSection),
];
