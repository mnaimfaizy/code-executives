/**
 * The exercises of the Playground, converted from the problem set of the retired old
 * playground (ADR 0004, decision 5).
 *
 * Every exercise carries a reference solution with an explanation. `exercises.test.ts`
 * proves that the solution passes all its checks and that the starter code fails at least
 * one: write both when you add an exercise.
 */

import type { Exercise, ExerciseLesson, ExerciseLevel } from './types';

/**
 * A lesson's label names its module, because the Playground shows it outside the module's
 * own page. The part after the colon is the sidebar's label, and the address is the section's
 * own (`moduleNavigation.ts`): `exercises.test.ts` checks both.
 */
const dataStructures = (section: string): ExerciseLesson => ({
  label: `Data Structures: ${section}`,
  href: `/datastructures?section=${encodeURIComponent(section)}`,
});

/** Big-O addresses its sections by slug. */
const bigO = (section: string, slug: string): ExerciseLesson => ({
  label: `Big-O Notation: ${section}`,
  href: `/bigo?section=${slug}`,
});

export const exercises: Exercise[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    level: 'easy',
    summary: 'Find the two numbers in an array that add up to a target, and return their indices.',
    teaches: [
      dataStructures('Hash Tables'),
      bigO('Real-World Applications', 'real-world-applications'),
    ],
    task: `Write \`twoSum(nums, target)\`. It gets an array of integers and a target, and returns the indices of the two numbers that add up to the target.

Every input has exactly one answer, and one element cannot be used twice. The two indices may be returned in any order.`,
    starterCode: `function twoSum(nums, target) {
  // Return the indices of the two numbers that add up to target
}
`,
    entry: 'twoSum',
    compare: 'any-order',
    checks: [
      {
        args: [[2, 7, 11, 15], 9],
        expected: [0, 1],
        explanation: 'nums[0] + nums[1] is 2 + 7 = 9.',
      },
      {
        args: [[3, 2, 4], 6],
        expected: [1, 2],
        explanation: 'nums[1] + nums[2] is 2 + 4 = 6. Index 0 cannot be used twice.',
      },
      {
        args: [[3, 3], 6],
        expected: [0, 1],
        explanation: 'Two equal numbers at different indices are two elements.',
      },
      { args: [[-1, -2, -3, -4, -5], -8], expected: [2, 4], hidden: true },
      { args: [[0, 4, 3, 0], 0], expected: [0, 3], hidden: true },
    ],
    hints: [
      'For each number, the number it needs is target minus itself.',
      'Keep the numbers you have already seen in a Map, from value to index.',
      'Before adding a number to the Map, look up the number it needs. If it is there, you have both indices.',
    ],
    solution: {
      code: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const needed = target - nums[i];
    if (seen.has(needed)) return [seen.get(needed), i];
    seen.set(nums[i], i);
  }
  return [];
}
`,
      explanation:
        'Walk the array once and keep every number already passed in a Map, a lookup table from a value to the index it was found at. For each number, the partner it needs is the target minus itself, and asking the Map for that partner takes one step however many numbers it holds. Because a number is stored only after its partner was looked up, one element is never used twice. The cost is one pass over the array, plus memory for the Map, which can grow to hold nearly every number.',
    },
    suggestedLens: 'stack-heap',
  },
  {
    id: 'contains-duplicate',
    title: 'Contains Duplicate',
    level: 'easy',
    summary: 'Say whether any value appears more than once in an array.',
    teaches: [dataStructures('Sets'), dataStructures('Hash Tables')],
    task: `Write \`containsDuplicate(nums)\`. It gets an array of integers and returns \`true\` if any value appears at least twice, and \`false\` if every value is distinct.`,
    starterCode: `function containsDuplicate(nums) {
  // Return true if a value appears at least twice, otherwise false
}
`,
    entry: 'containsDuplicate',
    checks: [
      { args: [[1, 2, 3, 1]], expected: true, explanation: 'The value 1 appears twice.' },
      { args: [[1, 2, 3, 4]], expected: false, explanation: 'Every value is distinct.' },
      {
        args: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]],
        expected: true,
        explanation: 'Several values appear more than once.',
      },
      { args: [[]], expected: false, hidden: true },
      { args: [[7]], expected: false, hidden: true },
      { args: [[0, -1, 5, -1]], expected: true, hidden: true },
    ],
    hints: [
      'Keep the values you have already seen in a Set.',
      'Before adding a value to the Set, check whether it is already there.',
    ],
    solution: {
      code: `function containsDuplicate(nums) {
  const seen = new Set();
  for (const value of nums) {
    if (seen.has(value)) return true;
    seen.add(value);
  }
  return false;
}
`,
      explanation:
        'Keep the values already passed in a Set, a collection that holds each value at most once and can say in one step whether it holds a given value. A value that is already in the Set when you reach it has appeared before, so the answer is true right away. If the loop ends without that happening, every value was distinct. The cost is one pass over the array, plus memory for the Set, which holds every value when there is no duplicate.',
    },
    suggestedLens: 'stack-heap',
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    level: 'easy',
    summary:
      'Decide whether every bracket in a string is closed by the right one, in the right order.',
    teaches: [dataStructures('Stacks')],
    task: `Write \`isValid(s)\`. It gets a string made only of the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, and returns \`true\` if the string is valid, otherwise \`false\`.

A string is valid when every opening bracket is closed by a bracket of the same type, brackets are closed in the right order, and every closing bracket has an opening bracket before it.`,
    starterCode: `function isValid(s) {
  // Return true if every bracket is closed by the right one, in the right order
}
`,
    entry: 'isValid',
    checks: [
      { args: ['()'], expected: true, explanation: 'One pair, opened and closed.' },
      { args: ['()[]{}'], expected: true, explanation: 'Three pairs, one after the other.' },
      { args: ['(]'], expected: false, explanation: 'A ( cannot be closed by a ].' },
      {
        args: ['([)]'],
        expected: false,
        explanation: 'The [ is still open when the ) arrives: the order is wrong.',
      },
      {
        args: ['{[]}'],
        expected: true,
        explanation: 'The inner pair closes before the outer one.',
      },
      { args: ['(('], expected: false, hidden: true },
      { args: [']'], expected: false, hidden: true },
    ],
    hints: [
      'Keep the opening brackets you have seen on a stack: an array you only push to and pop from.',
      'A closing bracket must match the bracket on top of the stack. Pop it and compare.',
      'At the end the stack must be empty: an opening bracket left on it was never closed.',
    ],
    solution: {
      code: `function isValid(s) {
  const stack = [];
  const opening = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char in opening) {
      if (stack.pop() !== opening[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}
`,
      explanation:
        'The bracket opened last must be the one closed first, and a stack gives exactly that order: an array you only push onto and pop from, so the last item in is the first out. Every opening bracket is pushed, and every closing bracket pops the top of the stack and must find its own opening bracket there. At the end the stack must be empty, or some bracket was never closed. The cost is one pass over the string, plus memory for the stack, which holds the whole string when it is all opening brackets.',
    },
    suggestedLens: 'stack-heap',
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    level: 'easy',
    summary: 'Reverse a singly linked list and return its new first node.',
    teaches: [dataStructures('Linked Lists')],
    task: `Write \`reverseList(head)\`. It gets the first node of a singly linked list and returns the first node of the reversed list.

A node is a plain object \`{ val, next }\`, where \`next\` is the following node or \`null\` at the end. The list 1 → 2 is passed in as \`{ val: 1, next: { val: 2, next: null } }\`, and an empty list is \`null\`. The checks compare the list you return node by node, so you may reuse the nodes you were given or build new ones.`,
    starterCode: `// A node is { val, next }; next is the following node, or null at the end.
function reverseList(head) {
  // Return the first node of the reversed list
}
`,
    entry: 'reverseList',
    checks: [
      {
        args: [{ val: 1, next: { val: 2, next: { val: 3, next: null } } }],
        expected: { val: 3, next: { val: 2, next: { val: 1, next: null } } },
        explanation: '1 → 2 → 3 becomes 3 → 2 → 1.',
      },
      {
        args: [{ val: 1, next: { val: 2, next: null } }],
        expected: { val: 2, next: { val: 1, next: null } },
        explanation: '1 → 2 becomes 2 → 1.',
      },
      { args: [null], expected: null, explanation: 'An empty list reversed is an empty list.' },
      { args: [{ val: 7, next: null }], expected: { val: 7, next: null }, hidden: true },
      {
        args: [{ val: 5, next: { val: 5, next: { val: 9, next: { val: 0, next: null } } } }],
        expected: { val: 0, next: { val: 9, next: { val: 5, next: { val: 5, next: null } } } },
        hidden: true,
      },
    ],
    hints: [
      'Walk the list once and turn each `next` reference around.',
      'Use three variables: the previous node, the current node, and the node after it, saved before you overwrite `current.next`.',
      'When the current node is `null`, the previous node is the new first node.',
    ],
    solution: {
      code: `// A node is { val, next }; next is the following node, or null at the end.
function reverseList(head) {
  let previous = null;
  let current = head;
  while (current !== null) {
    const next = current.next;
    current.next = previous;
    previous = current;
    current = next;
  }
  return previous;
}
`,
      explanation:
        "Walk the list once and turn each node's `next` reference around so that it leads to the node before it. Overwriting `current.next` would lose the rest of the list, so the following node is saved in a variable first. When the walk runs off the end, `previous` holds the old last node, which is the first node of the reversed list. The cost is one pass and three variables, whatever the length of the list; no new node is made, so the list you were given is itself changed.",
    },
    suggestedLens: 'stack-heap',
  },
  {
    id: 'maximum-depth-binary-tree',
    title: 'Maximum Depth of Binary Tree',
    level: 'easy',
    summary: "Count the nodes on the longest path from a binary tree's root down to a leaf.",
    teaches: [dataStructures('Binary Trees')],
    task: `Write \`maxDepth(root)\`. It gets the root of a binary tree and returns the tree's maximum depth: the number of nodes on the longest path from the root down to a leaf.

A node is a plain object \`{ val, left, right }\`, where \`left\` and \`right\` are nodes or \`null\`. An empty tree is \`null\` and has depth 0.`,
    starterCode: `// A node is { val, left, right }; left and right are nodes or null.
function maxDepth(root) {
  // Return the number of nodes on the longest path from root to a leaf
}
`,
    entry: 'maxDepth',
    checks: [
      {
        args: [
          {
            val: 3,
            left: { val: 9, left: null, right: null },
            right: {
              val: 20,
              left: { val: 15, left: null, right: null },
              right: { val: 7, left: null, right: null },
            },
          },
        ],
        expected: 3,
        explanation: 'The longest paths are 3 → 20 → 15 and 3 → 20 → 7: three nodes.',
      },
      {
        args: [{ val: 1, left: null, right: { val: 2, left: null, right: null } }],
        expected: 2,
        explanation: 'The path 1 → 2 has two nodes.',
      },
      { args: [null], expected: 0, explanation: 'An empty tree has no nodes.' },
      { args: [{ val: 0, left: null, right: null }], expected: 1, hidden: true },
      {
        args: [
          {
            val: 1,
            left: {
              val: 2,
              left: { val: 3, left: { val: 4, left: null, right: null }, right: null },
              right: null,
            },
            right: null,
          },
        ],
        expected: 4,
        hidden: true,
      },
    ],
    hints: [
      'The depth of an empty tree is 0. That is the case that ends the recursion.',
      'The depth of a node is 1 plus the larger of the depths of its two subtrees.',
    ],
    solution: {
      code: `// A node is { val, left, right }; left and right are nodes or null.
function maxDepth(root) {
  if (root === null) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
`,
      explanation:
        'The depth of a tree is 1 for its root plus the depth of its deeper subtree, and a subtree is a tree, so the function can call itself on each child (that is recursion). An empty tree has depth 0, and that case is what stops the calls. Every node is visited once. The cost to watch is the call stack: each call waits for the calls below it, so as many frames as the tree is deep are open at the same time.',
    },
    suggestedLens: 'stack-heap',
  },
  {
    id: 'implement-queue-using-stacks',
    title: 'Implement Queue using Stacks',
    level: 'easy',
    summary: 'Build a first in, first out queue that keeps its items in two stacks.',
    teaches: [dataStructures('Queues'), dataStructures('Stacks')],
    task: `Complete the class \`MyQueue\`: a first in, first out queue that stores its items in two stacks. \`push(x)\` adds x at the back, \`pop()\` removes the front item and returns it, \`peek()\` returns the front item without removing it, and \`empty()\` returns \`true\` when the queue holds nothing.

Use arrays as the stacks, and only \`push\`, \`pop\`, \`length\` and reading the last item. The checks cannot see how you store the items, so keeping to that rule is up to you.

The checks call \`runQueue(operations)\`, which is already written below the class: it makes one \`MyQueue\`, calls the operations in order and returns the list of what each call returned, with \`null\` for a call that returned nothing. \`pop\` and \`peek\` are never called on an empty queue.`,
    starterCode: `class MyQueue {
  constructor() {
    // Set up the two stacks
  }

  push(x) {
    // Add x at the back of the queue
  }

  pop() {
    // Remove the front item and return it
  }

  peek() {
    // Return the front item without removing it
  }

  empty() {
    // Return true when the queue holds nothing
  }
}

// The checks call this. Leave it as it is.
// operations is a list such as [["push", 1], ["peek"], ["pop"], ["empty"]].
function runQueue(operations) {
  const queue = new MyQueue();
  const results = [];
  for (const [name, ...args] of operations) {
    const result = queue[name](...args);
    results.push(result === undefined ? null : result);
  }
  return results;
}
`,
    entry: 'runQueue',
    checks: [
      {
        args: [[['push', 1], ['push', 2], ['peek'], ['pop'], ['empty']]],
        expected: [null, null, 1, 1, false],
        explanation: '1 was pushed first, so peek and pop both return 1. 2 is still in the queue.',
      },
      {
        args: [[['empty'], ['push', 5], ['empty'], ['pop'], ['empty']]],
        expected: [true, null, false, 5, true],
        explanation: 'A new queue is empty, and it is empty again once its only item is popped.',
      },
      {
        args: [[['push', 1], ['push', 2], ['pop'], ['push', 3], ['pop'], ['pop']]],
        expected: [null, null, 1, null, 2, 3],
        explanation: 'An item pushed after a pop still leaves after the items pushed before it.',
      },
      {
        args: [
          [['push', 4], ['peek'], ['peek'], ['push', 6], ['pop'], ['peek'], ['pop'], ['empty']],
        ],
        expected: [null, 4, 4, null, 4, 6, 6, true],
        hidden: true,
      },
    ],
    hints: [
      'Use one stack for items coming in and one for items going out.',
      'Popping everything from the in stack and pushing it onto the out stack reverses the order: the oldest item ends up on top.',
      'Move the items only when the out stack is empty. Moving them at any other time puts newer items above older ones.',
    ],
    solution: {
      code: `class MyQueue {
  constructor() {
    this.incoming = [];
    this.outgoing = [];
  }

  push(x) {
    this.incoming.push(x);
  }

  // Refill the outgoing stack, only when it is empty
  move() {
    if (this.outgoing.length === 0) {
      while (this.incoming.length > 0) this.outgoing.push(this.incoming.pop());
    }
  }

  pop() {
    this.move();
    return this.outgoing.pop();
  }

  peek() {
    this.move();
    return this.outgoing[this.outgoing.length - 1];
  }

  empty() {
    return this.incoming.length === 0 && this.outgoing.length === 0;
  }
}

// The checks call this. Leave it as it is.
// operations is a list such as [["push", 1], ["peek"], ["pop"], ["empty"]].
function runQueue(operations) {
  const queue = new MyQueue();
  const results = [];
  for (const [name, ...args] of operations) {
    const result = queue[name](...args);
    results.push(result === undefined ? null : result);
  }
  return results;
}
`,
      explanation:
        'A stack hands items back newest first, and pouring one stack into another reverses that order, so the oldest item ends up on top, which is what a queue must hand out. New items go onto the incoming stack, and `pop` and `peek` read from the outgoing stack. The items are poured across only when the outgoing stack is empty, because pouring earlier would put newer items above older ones. One `pop` can be slow when it has to pour, but each item is moved only once in its life, so over many calls the work per call stays small.',
    },
    suggestedLens: 'stack-heap',
  },
  {
    id: 'binary-tree-inorder-traversal',
    title: 'Binary Tree Inorder Traversal',
    level: 'medium',
    summary:
      "List a binary tree's values in inorder: left subtree, then the node, then the right subtree.",
    teaches: [dataStructures('Binary Trees')],
    task: `Write \`inorderTraversal(root)\`. It gets the root of a binary tree and returns an array of the values of its nodes in inorder: for every node, first all the values of its left subtree, then the node's own value, then all the values of its right subtree.

A node is a plain object \`{ val, left, right }\`, where \`left\` and \`right\` are nodes or \`null\`. An empty tree is \`null\`, and its result is an empty array.`,
    starterCode: `// A node is { val, left, right }; left and right are nodes or null.
function inorderTraversal(root) {
  // Return the values: left subtree, then the node, then the right subtree
}
`,
    entry: 'inorderTraversal',
    checks: [
      {
        args: [
          {
            val: 1,
            left: null,
            right: { val: 2, left: { val: 3, left: null, right: null }, right: null },
          },
        ],
        expected: [1, 3, 2],
        explanation:
          '1 has no left subtree, so it comes first. Its right subtree is 2 with a left child 3, and 3 comes before 2.',
      },
      {
        args: [
          {
            val: 2,
            left: { val: 1, left: null, right: null },
            right: { val: 3, left: null, right: null },
          },
        ],
        expected: [1, 2, 3],
        explanation: 'The left child 1, then the root 2, then the right child 3.',
      },
      { args: [null], expected: [], explanation: 'An empty tree has no values.' },
      { args: [{ val: 5, left: null, right: null }], expected: [5], hidden: true },
      {
        args: [
          {
            val: 3,
            left: { val: 2, left: { val: 1, left: null, right: null }, right: null },
            right: null,
          },
        ],
        expected: [1, 2, 3],
        hidden: true,
      },
      {
        args: [
          {
            val: 8,
            left: {
              val: 4,
              left: { val: 9, left: null, right: null },
              right: { val: 6, left: { val: 5, left: null, right: null }, right: null },
            },
            right: { val: 2, left: null, right: { val: 7, left: null, right: null } },
          },
        ],
        expected: [9, 4, 5, 6, 8, 2, 7],
        hidden: true,
      },
    ],
    hints: [
      'A subtree is a tree, so a function that handles one node can call itself on `node.left` and on `node.right`. An empty subtree (`null`) adds nothing.',
      'Collect the values in one array. For each node: handle the left subtree, push `node.val`, then handle the right subtree. Only the place of the push decides the order.',
      'Without recursion, keep the nodes you still owe a visit on a stack: go left as far as you can, pushing each node, then pop one, take its value and continue with its right child.',
    ],
    solution: {
      code: `// A node is { val, left, right }; left and right are nodes or null.
function inorderTraversal(root) {
  const values = [];

  function visit(node) {
    if (node === null) return;
    visit(node.left);
    values.push(node.val);
    visit(node.right);
  }

  visit(root);
  return values;
}
`,
      explanation:
        "A subtree is itself a tree, so `visit` can call itself on each child (that is recursion), and an empty subtree ends the calls. The value is pushed between the two calls, so everything in a node's left subtree is already in the array and everything in its right subtree comes after: moving that one line is all that separates inorder from the other orders. Every node is visited once. The cost to watch is the call stack: each call waits for the calls below it, so as many frames as the tree is deep are open at the same time.",
    },
    suggestedLens: 'stack-heap',
  },
  {
    id: 'kth-largest-element',
    title: 'Kth Largest Element',
    level: 'medium',
    summary:
      'Return the kth largest value of an array, where a repeated value counts every time it appears.',
    teaches: [dataStructures('Heaps')],
    task: `Write \`findKthLargest(nums, k)\`. It gets a non-empty array of integers and a number \`k\`, and returns the kth largest value: the value at position k when the array is ordered from largest to smallest, counting from 1.

A repeated value counts once for each time it appears: in \`[5, 5, 4]\` the 2nd largest is 5, not 4. \`k\` is at least 1 and at most the length of the array.`,
    starterCode: `function findKthLargest(nums, k) {
  // Return the kth largest value of nums
}
`,
    entry: 'findKthLargest',
    checks: [
      {
        args: [[3, 2, 1, 5, 6, 4], 2],
        expected: 5,
        explanation: 'From largest to smallest the array is 6, 5, 4, 3, 2, 1. The 2nd value is 5.',
      },
      {
        args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4],
        expected: 4,
        explanation:
          'From largest to smallest the array is 6, 5, 5, 4, 3, 3, 2, 2, 1. Both 5s count, so the 4th value is 4.',
      },
      { args: [[1], 1], expected: 1, explanation: 'The only value is the largest.' },
      { args: [[10, 9, 100, 2], 1], expected: 100, hidden: true },
      { args: [[-1, -5, -3], 3], expected: -5, hidden: true },
      { args: [[7, 7, 7], 2], expected: 7, hidden: true },
    ],
    hints: [
      'If the array were ordered from largest to smallest, the answer would be at index `k - 1`.',
      'Called with no argument, `sort()` compares numbers as text, so 100 comes before 9. Pass it a function that compares two numbers: `(a, b) => b - a` puts the larger first.',
      'To do less work than a full sort, keep only the k largest values seen so far. The smallest of those k is the answer, and a min-heap is the structure that hands back its smallest value cheaply.',
    ],
    solution: {
      code: `function findKthLargest(nums, k) {
  // A copy, so the caller's array keeps its order
  const sorted = [...nums].sort((a, b) => b - a);
  return sorted[k - 1];
}
`,
      explanation:
        'Order a copy of the array from largest to smallest, and the kth largest value sits at index `k - 1`; repeated values each keep their own place, so they are counted as the task asks. `sort` needs the function `(a, b) => b - a`, because without one it compares numbers as text. Sorting orders every value, although only one position is needed, and that work grows a little faster than the length of the array. A min-heap, a tree that always has its smallest value at the top, does less: keep just the k largest values seen so far in it, drop the top whenever it holds more than k, and the top at the end is the answer.',
    },
    suggestedLens: 'stack-heap',
  },
  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray',
    level: 'medium',
    summary: "Find the largest sum that any contiguous run of an array's elements has.",
    task: `Write \`maxSubArray(nums)\`. It gets a non-empty array of integers and returns the largest sum that any contiguous run of its elements has. A run holds at least one element.`,
    starterCode: `function maxSubArray(nums) {
  // Return the largest sum of a contiguous run of elements
}
`,
    entry: 'maxSubArray',
    checks: [
      {
        args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]],
        expected: 6,
        explanation: 'The run [4, -1, 2, 1] has the largest sum: 6.',
      },
      { args: [[1]], expected: 1, explanation: 'The only run is [1].' },
      {
        args: [[-1]],
        expected: -1,
        explanation: 'A run holds at least one element, so the answer is -1, not 0.',
      },
      { args: [[5, 4, -1, 7, 8]], expected: 23, hidden: true },
      { args: [[-3, -1, -2]], expected: -1, hidden: true },
    ],
    hints: [
      'At each position, work out the best sum of a run that ends exactly there.',
      'That best sum is either the element alone, or the element added to the best sum that ended one position earlier. Take the larger.',
      'The answer is the largest of those sums over all positions. Start both from the first element, not from 0.',
    ],
    solution: {
      code: `function maxSubArray(nums) {
  let best = nums[0];
  let endingHere = nums[0];
  for (let i = 1; i < nums.length; i++) {
    endingHere = Math.max(nums[i], endingHere + nums[i]);
    best = Math.max(best, endingHere);
  }
  return best;
}
`,
      explanation:
        'For each position, keep the best sum of a run that ends exactly there. That run either continues the best run that ended one position earlier or starts fresh at this element, whichever is larger: a negative sum carried along only makes things worse, so it is dropped. The answer is the largest of those sums, and both variables start from the first element, so an array of only negative numbers still gives its largest element and not 0. The cost is one pass and two numbers, with no extra memory.',
    },
    suggestedLens: 'stack-heap',
  },
];

const LEVEL_LABELS: Record<ExerciseLevel, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

const LEVEL_ORDER: ExerciseLevel[] = ['easy', 'medium', 'hard'];

export interface ExerciseGroup {
  level: ExerciseLevel;
  label: string;
  exercises: Exercise[];
}

/** The exercises grouped by level, easiest first. A level with no exercise is left out. */
export function exercisesByLevel(list: Exercise[] = exercises): ExerciseGroup[] {
  return LEVEL_ORDER.map((level) => ({
    level,
    label: LEVEL_LABELS[level],
    exercises: list.filter((exercise) => exercise.level === level),
  })).filter((group) => group.exercises.length > 0);
}

export function findExercise(id: string | undefined): Exercise | undefined {
  return id === undefined ? undefined : exercises.find((exercise) => exercise.id === id);
}
