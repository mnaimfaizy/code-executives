// src/data/problems.ts
// Comprehensive problem database for the Visual Algorithm Playground

import type { PlaygroundProblem } from '../types/playground';

export const PROBLEM_DATABASE: PlaygroundProblem[] = [
  // ===== ARRAY PROBLEMS =====
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Data Structures',
    dataStructure: 'Array',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        id: 'example-1',
        input: [[2, 7, 11, 15], 9],
        expectedOutput: [0, 1],
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        id: 'example-2',
        input: [[3, 2, 4], 6],
        expectedOutput: [1, 2],
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
    // Write your solution here
    // Return indices of two numbers that add up to target
}`,
      python: `def two_sum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
    },
    testCases: [
      {
        id: 'test-1',
        input: [[2, 7, 11, 15], 9],
        expectedOutput: [0, 1],
      },
      {
        id: 'test-2',
        input: [[3, 2, 4], 6],
        expectedOutput: [1, 2],
      },
      {
        id: 'test-3',
        input: [[3, 3], 6],
        expectedOutput: [0, 1],
      },
    ],
    hints: [
      {
        id: 'hint-1',
        content: "Try using a hash map to store numbers you've seen and their indices.",
        order: 1,
        penalty: 5,
      },
      {
        id: 'hint-2',
        content: 'For each number, check if target - current number exists in your hash map.',
        order: 2,
        penalty: 10,
      },
    ],
    solution: {
      code: {
        javascript: `function twoSum(nums, target) {
    const map = new Map();

    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }

    return [];
}`,
        python: `def two_sum(nums, target):
    num_map = {}

    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i

    return []`,
      },
      explanation:
        'Use a hash map to store numbers and their indices. For each number, check if its complement (target - current) exists in the map.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      approaches: [
        {
          name: 'Hash Map Approach',
          description: 'Use a hash map to store seen numbers and their indices for O(1) lookups.',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(n)',
          code: {
            javascript: `function twoSum(nums, target) {
    const map = new Map();

    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }

    return [];
}`,
          },
        },
        {
          name: 'Brute Force',
          description: 'Check every pair of numbers - simple but inefficient.',
          timeComplexity: 'O(n²)',
          spaceComplexity: 'O(1)',
          code: {
            javascript: `function twoSum(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }

    return [];
}`,
          },
        },
      ],
    },
    visualizationOptions: ['Array', 'HashTable'],
    learningObjectives: [
      'Understand hash map usage for efficient lookups',
      'Practice array iteration and indexing',
      'Learn about time-space complexity trade-offs',
    ],
    tags: ['array', 'hash-table', 'two-pointer'],
    estimatedSolveTime: 30,
  },

  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    category: 'Algorithms',
    dataStructure: 'Array',
    description: `Given an integer array \`nums\`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

A subarray is a contiguous part of an array.`,
    examples: [
      {
        id: 'example-1',
        input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]],
        expectedOutput: 6,
        explanation: 'The subarray [4, -1, 2, 1] has the largest sum = 6.',
      },
      {
        id: 'example-2',
        input: [[1]],
        expectedOutput: 1,
        explanation: 'The subarray [1] has the largest sum = 1.',
      },
      {
        id: 'example-3',
        input: [[5, 4, -1, 7, 8]],
        expectedOutput: 23,
        explanation: 'The subarray [5, 4, -1, 7, 8] has the largest sum = 23.',
      },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    starterCode: {
      javascript: `function maxSubArray(nums) {
    // Write your solution here
    // Return the maximum sum of a contiguous subarray
}`,
      python: `def max_sub_array(nums):
    """
    :type nums: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    },
    testCases: [
      {
        id: 'test-1',
        input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]],
        expectedOutput: 6,
      },
      {
        id: 'test-2',
        input: [[1]],
        expectedOutput: 1,
      },
      {
        id: 'test-3',
        input: [[-1]],
        expectedOutput: -1,
      },
    ],
    hints: [
      {
        id: 'hint-1',
        content:
          "Consider using Kadane's algorithm - keep track of the maximum sum ending at each position.",
        order: 1,
        penalty: 5,
      },
      {
        id: 'hint-2',
        content:
          'Reset the current sum to 0 when it becomes negative, but keep track of the global maximum.',
        order: 2,
        penalty: 10,
      },
    ],
    solution: {
      code: {
        javascript: `function maxSubArray(nums) {
    let maxSum = nums[0];
    let currentSum = nums[0];

    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }

    return maxSum;
}`,
        python: `def max_sub_array(nums):
    if not nums:
        return 0

    max_sum = current_sum = nums[0]

    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)

    return max_sum`,
      },
      explanation:
        "Use Kadane's algorithm to track the maximum sum ending at each position and the global maximum.",
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      approaches: [
        {
          name: "Kadane's Algorithm",
          description:
            'Dynamic programming approach that tracks maximum subarray sum in linear time.',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)',
          code: {
            javascript: `function maxSubArray(nums) {
    let maxSum = nums[0];
    let currentSum = nums[0];

    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }

    return maxSum;
}`,
          },
        },
        {
          name: 'Divide and Conquer',
          description: 'Split array into halves and find maximum subarray in each part.',
          timeComplexity: 'O(n log n)',
          spaceComplexity: 'O(log n)',
          code: {
            javascript: `function maxSubArray(nums) {
    return findMaxSubarray(nums, 0, nums.length - 1);
}

function findMaxSubarray(nums, left, right) {
    if (left === right) return nums[left];

    const mid = Math.floor((left + right) / 2);

    const leftMax = findMaxSubarray(nums, left, mid);
    const rightMax = findMaxSubarray(nums, mid + 1, right);
    const crossMax = findMaxCrossingSubarray(nums, left, mid, right);

    return Math.max(leftMax, rightMax, crossMax);
}

function findMaxCrossingSubarray(nums, left, mid, right) {
    let leftSum = -Infinity;
    let sum = 0;

    for (let i = mid; i >= left; i--) {
        sum += nums[i];
        leftSum = Math.max(leftSum, sum);
    }

    let rightSum = -Infinity;
    sum = 0;

    for (let i = mid + 1; i <= right; i++) {
        sum += nums[i];
        rightSum = Math.max(rightSum, sum);
    }

    return leftSum + rightSum;
}`,
          },
        },
      ],
    },
    visualizationOptions: ['Array'],
    learningObjectives: [
      'Understand dynamic programming for optimization problems',
      "Learn Kadane's algorithm for maximum subarray",
      'Practice handling edge cases with negative numbers',
    ],
    tags: ['array', 'dynamic-programming', 'divide-and-conquer'],
    estimatedSolveTime: 45,
  },

  // ===== LINKED LIST PROBLEMS =====
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    category: 'Data Structures',
    dataStructure: 'LinkedList',
    description: `Given the \`head\` of a singly linked list, reverse the list, and return the reversed list.`,
    examples: [
      {
        id: 'example-1',
        input: [[1, 2, 3, 4, 5]],
        expectedOutput: [5, 4, 3, 2, 1],
        explanation: 'The linked list is reversed from [1,2,3,4,5] to [5,4,3,2,1].',
      },
    ],
    constraints: [
      'The number of nodes in the list is the range [0, 5000].',
      '-5000 <= Node.val <= 5000',
    ],
    starterCode: {
      javascript: `function reverseList(head) {
    // Write your solution here
    // Return the reversed linked list
}`,
      python: `def reverse_list(head):
    """
    :type head: ListNode
    :rtype: ListNode
    """
    # Write your solution here
    pass`,
    },
    testCases: [
      {
        id: 'test-1',
        input: [[1, 2, 3, 4, 5]],
        expectedOutput: [5, 4, 3, 2, 1],
      },
      {
        id: 'test-2',
        input: [[1, 2]],
        expectedOutput: [2, 1],
      },
      {
        id: 'test-3',
        input: [[]],
        expectedOutput: [],
      },
    ],
    hints: [
      {
        id: 'hint-1',
        content: 'Use three pointers: previous, current, and next to reverse the links.',
        order: 1,
        penalty: 5,
      },
      {
        id: 'hint-2',
        content:
          'Iterate through the list, updating the next pointer of each node to point to the previous node.',
        order: 2,
        penalty: 10,
      },
    ],
    solution: {
      code: {
        javascript: `function reverseList(head) {
    let prev = null;
    let current = head;

    while (current !== null) {
        const next = current.next;
        current.next = prev;
        prev = current;
        current = next;
    }

    return prev;
}`,
        python: `def reverse_list(head):
    prev = None
    current = head

    while current:
        next_node = current.next
        current.next = prev
        prev = current
        current = next_node

    return prev`,
      },
      explanation:
        'Use iterative approach with three pointers to reverse the direction of all links in the linked list.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      approaches: [
        {
          name: 'Iterative',
          description: 'Use three pointers to reverse links iteratively.',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)',
          code: {
            javascript: `function reverseList(head) {
    let prev = null;
    let current = head;

    while (current !== null) {
        const next = current.next;
        current.next = prev;
        prev = current;
        current = next;
    }

    return prev;
}`,
          },
        },
        {
          name: 'Recursive',
          description: 'Use recursion to reverse the list from the end.',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(n)',
          code: {
            javascript: `function reverseList(head) {
    if (head === null || head.next === null) {
        return head;
    }

    const reversedHead = reverseList(head.next);
    head.next.next = head;
    head.next = null;

    return reversedHead;
}`,
          },
        },
      ],
    },
    visualizationOptions: ['LinkedList'],
    learningObjectives: [
      'Understand linked list traversal and pointer manipulation',
      'Learn iterative vs recursive approaches',
      'Practice pointer operations in data structures',
    ],
    tags: ['linked-list', 'recursion', 'two-pointers'],
    estimatedSolveTime: 25,
  },

  // ===== STACK PROBLEMS =====
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Data Structures',
    dataStructure: 'Stack',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{' \`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:

1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        id: 'example-1',
        input: ['()'],
        expectedOutput: true,
        explanation: 'The string is valid.',
      },
      {
        id: 'example-2',
        input: ['()[]{}'],
        expectedOutput: true,
        explanation: 'The string is valid.',
      },
      {
        id: 'example-3',
        input: ['(]'],
        expectedOutput: false,
        explanation:
          'The string is invalid because the closing bracket does not match the opening bracket.',
      },
    ],
    constraints: ['1 <= s.length <= 10^4', "s consists of parentheses only '()[]{}'."],
    starterCode: {
      javascript: `function isValid(s) {
    // Write your solution here
    // Return true if parentheses are valid, false otherwise
}`,
      python: `def is_valid(s):
    """
    :type s: str
    :rtype: bool
    """
    # Write your solution here
    pass`,
    },
    testCases: [
      {
        id: 'test-1',
        input: ['()'],
        expectedOutput: true,
      },
      {
        id: 'test-2',
        input: ['()[]{}'],
        expectedOutput: true,
      },
      {
        id: 'test-3',
        input: ['(]'],
        expectedOutput: false,
      },
      {
        id: 'test-4',
        input: ['([)]'],
        expectedOutput: false,
      },
      {
        id: 'test-5',
        input: ['{[]}'],
        expectedOutput: true,
      },
    ],
    hints: [
      {
        id: 'hint-1',
        content: 'Use a stack to keep track of opening brackets.',
        order: 1,
        penalty: 5,
      },
      {
        id: 'hint-2',
        content: 'When you encounter a closing bracket, check if it matches the top of the stack.',
        order: 2,
        penalty: 10,
      },
    ],
    solution: {
      code: {
        javascript: `function isValid(s) {
    const stack = [];
    const bracketMap = {
        ')': '(',
        '}': '{',
        ']': '['
    };

    for (const char of s) {
        if (char in bracketMap) {
            const top = stack.pop();
            if (top !== bracketMap[char]) {
                return false;
            }
        } else {
            stack.push(char);
        }
    }

    return stack.length === 0;
}`,
        python: `def is_valid(s):
    stack = []
    bracket_map = {
        ')': '(',
        '}': '{',
        ']': '['
    }

    for char in s:
        if char in bracket_map:
            if not stack:
                return False
            top = stack.pop()
            if top != bracket_map[char]:
                return False
        else:
            stack.append(char)

    return not stack`,
      },
      explanation:
        'Use a stack to track opening brackets. When encountering a closing bracket, check if it matches the top of the stack.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      approaches: [
        {
          name: 'Stack Approach',
          description: 'Use a stack to match opening and closing brackets.',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(n)',
          code: {
            javascript: `function isValid(s) {
    const stack = [];
    const bracketMap = {
        ')': '(',
        '}': '{',
        ']': '['
    };

    for (const char of s) {
        if (char in bracketMap) {
            const top = stack.pop();
            if (top !== bracketMap[char]) {
                return false;
            }
        } else {
            stack.push(char);
        }
    }

    return stack.length === 0;
}`,
          },
        },
      ],
    },
    visualizationOptions: ['Stack'],
    learningObjectives: [
      'Understand stack data structure and LIFO principle',
      'Learn bracket matching algorithms',
      'Practice string processing and character comparison',
    ],
    tags: ['stack', 'string', 'parentheses'],
    estimatedSolveTime: 20,
  },

  // ===== QUEUE PROBLEMS =====
  {
    id: 'implement-queue-using-stacks',
    title: 'Implement Queue using Stacks',
    difficulty: 'Easy',
    category: 'Data Structures',
    dataStructure: 'Queue',
    description: `Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (\`push\`, \`peek\`, \`pop\`, and \`empty\`).

Implement the \`MyQueue\` class:

- \`void push(int x)\` Pushes element x to the back of the queue.
- \`int pop()\` Removes the element from the front of the queue and returns it.
- \`int peek()\` Returns the element at the front of the queue.
- \`boolean empty()\` Returns \`true\` if the queue is empty, otherwise returns \`false\`.

**Notes:**

- You must use only standard operations of a stack, which means only \`push to top\`, \`peek/pop from top\`, \`size\`, and \`is empty\` operations are valid.
- Depending on your language, the stack may not be supported natively. You may simulate a stack using a list or deque (double-ended queue) as long as you use only a stack's standard operations.`,
    examples: [
      {
        id: 'example-1',
        input: [
          ['MyQueue', 'push', 'push', 'peek', 'pop', 'empty'],
          [[], [1], [2], [], [], []],
        ],
        expectedOutput: [null, null, null, 1, 1, false],
        explanation: 'The queue operations are performed as described.',
      },
    ],
    constraints: [
      '1 <= x <= 9',
      'At most 100 calls will be made to push, pop, peek, and empty.',
      'All the calls to pop and peek are valid.',
    ],
    starterCode: {
      javascript: `class MyQueue {
    constructor() {
        // Initialize your data structure here
    }

    /**
     * Push element x to the back of queue.
     * @param {number} x
     * @return {void}
     */
    push(x) {
        // Write your implementation here
    }

    /**
     * Removes the element from in front of queue and returns that element.
     * @return {number}
     */
    pop() {
        // Write your implementation here
    }

    /**
     * Get the front element.
     * @return {number}
     */
    peek() {
        // Write your implementation here
    }

    /**
     * Returns whether the queue is empty.
     * @return {boolean}
     */
    empty() {
        // Write your implementation here
    }
}`,
      python: `class MyQueue:

    def __init__(self):
        # Initialize your data structure here
        pass

    def push(self, x: int) -> None:
        # Push element x to the back of queue
        pass

    def pop(self) -> int:
        # Removes the element from in front of queue and returns that element
        pass

    def peek(self) -> int:
        # Get the front element
        pass

    def empty(self) -> bool:
        # Returns whether the queue is empty
        pass`,
    },
    testCases: [
      {
        id: 'test-1',
        input: [
          ['push', 'push', 'peek', 'pop', 'empty'],
          [[1], [2], [], [], []],
        ],
        expectedOutput: [null, null, 1, 1, false],
      },
    ],
    hints: [
      {
        id: 'hint-1',
        content: 'Use two stacks: one for input operations and one for output operations.',
        order: 1,
        penalty: 5,
      },
      {
        id: 'hint-2',
        content:
          'When popping/peeking, if the output stack is empty, transfer all elements from input stack to output stack.',
        order: 2,
        penalty: 10,
      },
    ],
    solution: {
      code: {
        javascript: `class MyQueue {
    constructor() {
        this.inputStack = [];
        this.outputStack = [];
    }

    push(x) {
        this.inputStack.push(x);
    }

    pop() {
        this.peek();
        return this.outputStack.pop();
    }

    peek() {
        if (this.outputStack.length === 0) {
            while (this.inputStack.length > 0) {
                this.outputStack.push(this.inputStack.pop());
            }
        }
        return this.outputStack[this.outputStack.length - 1];
    }

    empty() {
        return this.inputStack.length === 0 && this.outputStack.length === 0;
    }
}`,
        python: `class MyQueue:

    def __init__(self):
        self.input_stack = []
        self.output_stack = []

    def push(self, x: int) -> None:
        self.input_stack.append(x)

    def pop(self) -> int:
        self.peek()
        return self.output_stack.pop()

    def peek(self) -> int:
        if not self.output_stack:
            while self.input_stack:
                self.output_stack.append(self.input_stack.pop())
        return self.output_stack[-1]

    def empty(self) -> bool:
        return not self.input_stack and not self.output_stack`,
      },
      explanation:
        'Use two stacks - one for input operations and one for output. Transfer elements when needed for FIFO behavior.',
      timeComplexity: 'O(1) amortized',
      spaceComplexity: 'O(n)',
      approaches: [
        {
          name: 'Two Stack Approach',
          description: 'Use two stacks to simulate queue behavior with amortized O(1) operations.',
          timeComplexity: 'O(1) amortized',
          spaceComplexity: 'O(n)',
          code: {
            javascript: `class MyQueue {
    constructor() {
        this.inputStack = [];
        this.outputStack = [];
    }

    push(x) {
        this.inputStack.push(x);
    }

    pop() {
        this.peek();
        return this.outputStack.pop();
    }

    peek() {
        if (this.outputStack.length === 0) {
            while (this.inputStack.length > 0) {
                this.outputStack.push(this.inputStack.pop());
            }
        }
        return this.outputStack[this.outputStack.length - 1];
    }

    empty() {
        return this.inputStack.length === 0 && this.outputStack.length === 0;
    }
}`,
          },
        },
      ],
    },
    visualizationOptions: ['Queue', 'Stack'],
    learningObjectives: [
      'Understand how to implement one data structure using another',
      'Learn amortized analysis for algorithm complexity',
      'Practice stack operations and queue semantics',
    ],
    tags: ['stack', 'queue', 'design'],
    estimatedSolveTime: 35,
  },

  // ===== HASH TABLE PROBLEMS =====
  {
    id: 'contains-duplicate',
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    category: 'Data Structures',
    dataStructure: 'HashTable',
    description: `Given an integer array \`nums\`, return \`true\` if any value appears at least twice in the array, and return \`false\` if every element is distinct.`,
    examples: [
      {
        id: 'example-1',
        input: [[1, 2, 3, 1]],
        expectedOutput: true,
        explanation: 'The array contains 1 twice.',
      },
      {
        id: 'example-2',
        input: [[1, 2, 3, 4]],
        expectedOutput: false,
        explanation: 'All elements are distinct.',
      },
      {
        id: 'example-3',
        input: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]],
        expectedOutput: true,
        explanation: 'The array contains duplicates.',
      },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
    starterCode: {
      javascript: `function containsDuplicate(nums) {
    // Write your solution here
    // Return true if array contains duplicates, false otherwise
}`,
      python: `def contains_duplicate(nums):
    """
    :type nums: List[int]
    :rtype: bool
    """
    # Write your solution here
    pass`,
    },
    testCases: [
      {
        id: 'test-1',
        input: [[1, 2, 3, 1]],
        expectedOutput: true,
      },
      {
        id: 'test-2',
        input: [[1, 2, 3, 4]],
        expectedOutput: false,
      },
      {
        id: 'test-3',
        input: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]],
        expectedOutput: true,
      },
    ],
    hints: [
      {
        id: 'hint-1',
        content: 'Use a hash set to track seen numbers.',
        order: 1,
        penalty: 5,
      },
      {
        id: 'hint-2',
        content: 'For each number, check if it already exists in the set before adding it.',
        order: 2,
        penalty: 10,
      },
    ],
    solution: {
      code: {
        javascript: `function containsDuplicate(nums) {
    const seen = new Set();

    for (const num of nums) {
        if (seen.has(num)) {
            return true;
        }
        seen.add(num);
    }

    return false;
}`,
        python: `def contains_duplicate(nums):
    seen = set()

    for num in nums:
        if num in seen:
            return True
        seen.add(num)

    return False`,
      },
      explanation:
        "Use a hash set to track numbers we've seen. If we encounter a number already in the set, return true.",
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      approaches: [
        {
          name: 'Hash Set',
          description: 'Use a hash set for O(1) lookups to detect duplicates.',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(n)',
          code: {
            javascript: `function containsDuplicate(nums) {
    const seen = new Set();

    for (const num of nums) {
        if (seen.has(num)) {
            return true;
        }
        seen.add(num);
    }

    return false;
}`,
          },
        },
        {
          name: 'Sorting',
          description: 'Sort the array and check adjacent elements.',
          timeComplexity: 'O(n log n)',
          spaceComplexity: 'O(1)',
          code: {
            javascript: `function containsDuplicate(nums) {
    nums.sort((a, b) => a - b);

    for (let i = 1; i < nums.length; i++) {
        if (nums[i] === nums[i - 1]) {
            return true;
        }
    }

    return false;
}`,
          },
        },
      ],
    },
    visualizationOptions: ['HashTable', 'Array'],
    learningObjectives: [
      'Understand hash table operations and collision handling',
      'Learn set data structure usage',
      'Practice duplicate detection algorithms',
    ],
    tags: ['hash-table', 'array', 'set'],
    estimatedSolveTime: 15,
  },

  // ===== BINARY TREE PROBLEMS =====
  {
    id: 'maximum-depth-binary-tree',
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'Easy',
    category: 'Data Structures',
    dataStructure: 'BinaryTree',
    description: `Given the \`root\` of a binary tree, return its maximum depth.

A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.`,
    examples: [
      {
        id: 'example-1',
        input: [[3, 9, 20, null, null, 15, 7]],
        expectedOutput: 3,
        explanation: 'The maximum depth is 3 (3 -> 20 -> 15 or 3 -> 20 -> 7).',
      },
      {
        id: 'example-2',
        input: [[1, null, 2]],
        expectedOutput: 2,
        explanation: 'The maximum depth is 2 (1 -> 2).',
      },
    ],
    constraints: [
      'The number of nodes in the tree is in the range [0, 10^4].',
      '-100 <= Node.val <= 100',
    ],
    starterCode: {
      javascript: `function maxDepth(root) {
    // Write your solution here
    // Return the maximum depth of the binary tree
}`,
      python: `def max_depth(root):
    """
    :type root: TreeNode
    :rtype: int
    """
    # Write your solution here
    pass`,
    },
    testCases: [
      {
        id: 'test-1',
        input: [[3, 9, 20, null, null, 15, 7]],
        expectedOutput: 3,
      },
      {
        id: 'test-2',
        input: [[1, null, 2]],
        expectedOutput: 2,
      },
      {
        id: 'test-3',
        input: [[]],
        expectedOutput: 0,
      },
    ],
    hints: [
      {
        id: 'hint-1',
        content: 'Use recursion to calculate the depth of left and right subtrees.',
        order: 1,
        penalty: 5,
      },
      {
        id: 'hint-2',
        content: 'The maximum depth is 1 + max(left subtree depth, right subtree depth).',
        order: 2,
        penalty: 10,
      },
    ],
    solution: {
      code: {
        javascript: `function maxDepth(root) {
    if (root === null) {
        return 0;
    }

    const leftDepth = maxDepth(root.left);
    const rightDepth = maxDepth(root.right);

    return Math.max(leftDepth, rightDepth) + 1;
}`,
        python: `def max_depth(root):
    if not root:
        return 0

    left_depth = max_depth(root.left)
    right_depth = max_depth(root.right)

    return max(left_depth, right_depth) + 1`,
      },
      explanation:
        'Use recursive DFS to calculate the maximum depth by finding the deepest path from root to leaf.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(h)',
      approaches: [
        {
          name: 'Recursive DFS',
          description: 'Use recursion to traverse the tree and calculate maximum depth.',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(h)',
          code: {
            javascript: `function maxDepth(root) {
    if (root === null) {
        return 0;
    }

    const leftDepth = maxDepth(root.left);
    const rightDepth = maxDepth(root.right);

    return Math.max(leftDepth, rightDepth) + 1;
}`,
          },
        },
        {
          name: 'Iterative BFS',
          description: 'Use a queue for level-order traversal to find the maximum depth.',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(w)',
          code: {
            javascript: `function maxDepth(root) {
    if (root === null) {
        return 0;
    }

    const queue = [root];
    let depth = 0;

    while (queue.length > 0) {
        const levelSize = queue.length;
        depth++;

        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
    }

    return depth;
}`,
          },
        },
      ],
    },
    visualizationOptions: ['BinaryTree'],
    learningObjectives: [
      'Understand tree traversal algorithms (DFS, BFS)',
      'Learn recursive tree algorithms',
      'Practice height/depth calculations',
    ],
    tags: ['tree', 'depth-first-search', 'breadth-first-search', 'binary-tree'],
    estimatedSolveTime: 20,
  },
];

// Helper function to get problems by difficulty (memoization-friendly)
export const getProblemsByDifficulty = (
  difficulty: 'Easy' | 'Medium' | 'Hard'
): PlaygroundProblem[] => {
  return PROBLEM_DATABASE.filter((problem) => problem.difficulty === difficulty);
};

// Helper function to get problems by data structure (memoization-friendly)
export const getProblemsByDataStructure = (dataStructure: string): PlaygroundProblem[] => {
  return PROBLEM_DATABASE.filter((problem) => problem.dataStructure === dataStructure);
};

// Helper function to get problems by category (memoization-friendly)
export const getProblemsByCategory = (category: string): PlaygroundProblem[] => {
  return PROBLEM_DATABASE.filter((problem) => problem.category === category);
};

// Helper function to get a specific problem by ID (O(n) lookup - consider Map for large datasets)
export const getProblemById = (id: string): PlaygroundProblem | undefined => {
  return PROBLEM_DATABASE.find((problem) => problem.id === id);
};

// Get all problems (returns reference to constant array)
export const getAllProblems = (): PlaygroundProblem[] => {
  return PROBLEM_DATABASE;
};

// Get random problems for practice (creates new array, use sparingly)
export const getRandomProblems = (count: number = 5): PlaygroundProblem[] => {
  const shuffled = [...PROBLEM_DATABASE].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, PROBLEM_DATABASE.length));
};

// Create a Map for O(1) lookups if needed (use with useMemo in components)
export const createProblemIdMap = (): Map<string, PlaygroundProblem> => {
  return new Map(PROBLEM_DATABASE.map((problem) => [problem.id, problem]));
};

// Get unique values for filters (useful for dropdown options)
export const getUniqueCategories = (): string[] => {
  return Array.from(new Set(PROBLEM_DATABASE.map((p) => p.category)));
};

export const getUniqueDataStructures = (): string[] => {
  const dataStructures = PROBLEM_DATABASE.map((p) => p.dataStructure).filter(
    (ds) => ds !== undefined
  );
  return Array.from(new Set(dataStructures)) as string[];
};

export const getUniqueDifficulties = (): Array<'Easy' | 'Medium' | 'Hard'> => {
  return ['Easy', 'Medium', 'Hard'];
};
