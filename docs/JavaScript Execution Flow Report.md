# **The Inner Workings of JavaScript: An Under-the-Hood Report**

## **1. Defining JavaScript: The Language and Its Ecosystem**

### **1.1 A Comprehensive Definition**

JavaScript is a powerful, multi-paradigm programming language and a foundational technology of the World Wide Web, operating in concert with HTML and CSS to create rich, interactive user experiences.1 Whereas HTML provides the structure and CSS the style, JavaScript supplies the dynamic functionality and behavior that modern web users expect, such as animated image carousels, responsive menus, and dynamic content changes.2 While its origins classify it as a scripting or interpreted language—where a program, known as a JavaScript engine, directly translates code into machine instructions—the modern reality is far more sophisticated.3 Contemporary engines employ a method known as Just-in-Time (JIT) compilation, which combines the speed of interpretation with the performance optimizations of compilation to execute code with remarkable efficiency.3

### **1.2 A Brief History: From LiveScript to ECMAScript Standardization**

The journey of JavaScript from a simple scripting tool to a general-purpose language began with its hurried creation in 1995 by Brendan Eich, a programmer at Netscape Communications.2 Developed in just 10 days, the language was initially named Mocha, then LiveScript.2 The name "JavaScript" was a strategic choice by Netscape to capitalize on the immense popularity of the Java programming language at the time.2 This marketing decision, while a simple ploy, had a profound and lasting effect, as the two languages are fundamentally distinct and unrelated beyond a few superficial syntactic similarities.2

The initial implementation sparked the "browser wars," as rival companies like Microsoft developed their own incompatible versions of the language, creating a major challenge for developers who struggled to write code that would function across different browsers.2 This fragmentation and a widespread "headache for developers" were the primary drivers for the submission of JavaScript to the European Computer Manufacturers Association (ECMA) for standardization.2 The resulting specification, officially named ECMAScript, became the blueprint for the language.2 Today, all major web browsers adhere to the ECMAScript standard, ensuring a consistent and predictable development environment. This historical chaos, ironically, laid the groundwork for the unified language that powers over 90 percent of all websites today.2 The progression of the language from a rushed project to a formalized global standard is best illustrated by a timeline of its key milestones.

| Year | Event                                                    | Significance                                                                                                       |
| :--- | :------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| 1995 | Brendan Eich creates LiveScript in 10 days.              | The language's initial release for Netscape Navigator.                                                             |
| 1996 | The name is changed to JavaScript as a marketing tactic. | The start of market proliferation and the "browser wars."                                                          |
| 1997 | JavaScript is standardized by ECMA as ECMAScript 1.      | Formalization of the language and the beginning of a unified web.                                                  |
| 2008 | Google releases the high-performance V8 engine.          | A crucial turning point that enabled the creation of sophisticated, performance-intensive applications.            |
| 2009 | Ryan Dahl releases Node.js, built on the V8 engine.      | JavaScript is freed from the browser's confines, enabling its use for server-side and general-purpose development. |

### **1.3 The Paradigms: An Overview of Multi-paradigm Capabilities**

JavaScript is a multi-paradigm language, a characteristic that accounts for much of its flexibility and broad adoption.1 It is not confined to a single approach but supports a variety of programming styles, including event-driven, functional, imperative, procedural, and object-oriented paradigms.1 This allows developers to choose the style best suited for a particular task or to combine them within a single application. For example, its event-driven nature is fundamental to modern web applications, where user interactions such as clicks or keystrokes trigger specific functions, while its support for first-class functions and closures enables sophisticated functional programming patterns.1

### **1.4 The Ecosystem: Client-Side vs. Server-Side Runtimes**

Historically, JavaScript was a technology of the client side, running exclusively within web browsers to make static webpages dynamic.3 In this context, the dedicated JavaScript engine embedded in the browser executes the code, modifying the webpage's structure and style dynamically in response to user events.1

However, the language outgrew its origins with the introduction of Node.js in 2009.6 Node.js provided a runtime environment to execute JavaScript code from outside a browser, leading to the rise of "server-side JavaScript".3 This development unshackled JavaScript, allowing it to be used for a wide range of applications, from building complex backend server logic and database access to creating desktop and mobile applications.3 This duality—its historical role on the client side and its modern expansion to the server side—is a key aspect of its current ubiquity.

## **2. The JavaScript Engine: The Heart of Execution**

### **2.1 What is a JavaScript Engine?**

A JavaScript engine is the program responsible for translating human-readable JavaScript code into machine-readable instructions that a computer's hardware can execute.4 The engine acts as a crucial intermediary between a developer's code and the underlying machine.4 Every major web browser comes equipped with its own built-in engine, such as Google's V8 (used in Chrome and Node.js), Mozilla's SpiderMonkey (Firefox), and Apple's JavaScriptCore (Safari).5 These engines are the reason developers do not need to install any additional software to run JavaScript code in a browser.9

### **2.2 The Two Pillars: The Call Stack and the Memory Heap**

Every JavaScript engine, regardless of its specific implementation, is built upon two fundamental components: the Call Stack and the Memory Heap.4 The Call Stack is a LIFO (Last-In, First-Out) data structure that keeps track of the execution flow of a program.8 When a function is called, an entry is pushed onto the top of the stack, and when the function completes its execution, it is popped off.8 This mechanism underpins JavaScript's synchronous, single-threaded nature, as only one function can be on top of the stack and actively executing at any given moment.9

In contrast, the Memory Heap is an unstructured memory pool where all dynamically allocated objects and variables are stored.4 This includes functions, arrays, and other complex data structures whose size is not known at compile time.11 While the Call Stack manages the execution order of the code, the Memory Heap is responsible for storing all the data that the application needs to operate.4

### **2.3 The V8 Engine: A Deep Dive into its Components**

The V8 engine, an open-source, high-performance engine written in C++, is a prime example of a modern JavaScript engine and was instrumental in elevating the language's performance and popularity.6 Its architecture reveals a sophisticated, multi-stage process for executing code.

#### **2.3.1 From Source Code to Abstract Syntax Tree (AST)**

The first step in V8's process is parsing.10 The engine reads the source code and breaks it down into meaningful components, known as tokens, according to the language's syntax.10 These tokens are then used to build a structured data representation of the code called the Abstract Syntax Tree (AST).4 The AST is a critical intermediate step that serves as the foundation for all subsequent compilation and execution phases, and its creation is also used to check for any syntax errors in the code.10

#### **2.3.2 Just-in-Time (JIT) Compilation: The Ignition-TurboFan Pipeline**

Modern JavaScript engines, including V8, have moved away from pure interpretation and instead employ Just-in-Time (JIT) compilation to balance fast startup times with optimized performance.4 V8's approach is a two-part pipeline that starts with an interpreter and then uses a compiler for optimization. The engine's interpreter, named

**Ignition**, takes the AST as input and quickly converts the code into bytecode.12 This allows the program to begin execution almost immediately, without the delay of a full compilation.4

While Ignition is running the bytecode, a background **Profiler** monitors the code to identify "hot spots"—functions or sections of code that are executed frequently.12 The profiler provides "type feedback" about these hot spots to the optimizing compiler,

**TurboFan**.12 TurboFan then takes the bytecode and recompiles it into highly optimized machine code, which can be executed much faster.12 If the data types or conditions of the code change, invalidating TurboFan's optimizations, the engine can "de-optimize" the code and revert to Ignition until new optimizations can be made.12 The V8 engine's compilation process is best understood as a fluid pipeline.

| Phase             | Component              | Input                   | Output                     | Description                                                                                                                              |
| :---------------- | :--------------------- | :---------------------- | :------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Parsing        | Parser                 | Source Code             | Abstract Syntax Tree (AST) | The source code is read, tokenized, and structured into a tree-like data representation, with syntax errors checked during this process. |
| 2. Interpretation | Ignition (Interpreter) | AST                     | Bytecode                   | The AST is quickly converted into an intermediate bytecode, allowing for immediate execution of the program.                             |
| 3. Profiling      | Profiler               | Bytecode, Runtime Data  | Type Feedback              | Code is monitored during execution to identify "hot spots" and gather information on data types to be sent to the compiler.              |
| 4. Optimization   | TurboFan (Compiler)    | Bytecode, Type Feedback | Optimized Machine Code     | The bytecode for "hot spots" is recompiled into highly efficient machine code, which is then executed directly by the hardware.          |

#### **2.3.3 The Role of Inline Caches (ICs) in Optimization**

To further enhance performance, V8 uses a specialized optimization technique called **Inline Caching (ICs)**.12 Inline Caches keep track of the addresses of object properties and the data types associated with them.12 The compiler uses this information to make educated guesses about how the code will behave, allowing it to generate highly specialized and efficient machine code for frequently accessed properties. This reduces the time it takes for the engine to look up property values, leading to significant performance gains.12 The seamless integration of these advanced features illustrates how V8, and modern engines in general, function as complex, multi-threaded systems to power a single-threaded language.10

## **3. The JavaScript Runtime: The Execution Environment**

### **3.1 Engine vs. Runtime: A Critical Distinction**

A common misconception is that the JavaScript engine is the sole component responsible for a program's execution.13 In reality, the engine is a program that implements the core ECMAScript specification, which defines the fundamental syntax and objects of the language itself, such as

Object and Array.7 However, the ECMAScript standard does not provide any capabilities for input or output.7

The JavaScript runtime is the environment that hosts the engine and provides the critical external functionalities needed for a program to interact with the outside world.7 The runtime is a program that embeds a JavaScript engine and augments it with additional features and APIs.7 For example, a

switch statement is a core part of the language and is handled by the engine, while an API like setTimeout() is a feature of the runtime environment.7 The Event Loop, which is central to asynchronous behavior, is a feature of the runtime and not the engine.7 This is a crucial distinction, as the asynchronous capabilities of JavaScript are not an inherent feature of the language itself, but rather a service provided by the specific environment in which it runs.7

| Component          | JavaScript Engine                                                               | JavaScript Runtime                                                                                      |
| :----------------- | :------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------ |
| **Purpose**        | To parse, compile, and execute JavaScript (ECMAScript) code.                    | To provide a complete environment for a program to run, including external functionalities.             |
| **Core Standard**  | ECMA-262 Specification.                                                         | Depends on the host, e.g., HTML standard (for browsers) or Node.js APIs.                                |
| **Key Components** | Call Stack, Memory Heap, Parser, JIT Compiler.                                  | JavaScript Engine, Web APIs, Event Loop, Callback Queue(s).                                             |
| **Example APIs**   | Core language constructs like Object, Array, Promise, and the switch statement. | Browser-specific APIs like setTimeout(), fetch(), DOM APIs, or server-side APIs for file system access. |

### **3.2 The Browser Runtime Environment and Web APIs**

In a web browser, the runtime environment is comprised of the JavaScript engine, **Web APIs**, a **Callback Queue** (or Macrotask Queue), a **Microtask Queue**, and the **Event Loop**.9 Web APIs are "facade functions" provided by the browser itself, which look like JavaScript functions but are not part of the core language.11 They handle time-consuming or asynchronous operations off the main thread, such as manipulating the Document Object Model (DOM), fetching data from a network (

fetch), and handling timers (setTimeout).9 This allows the main thread to continue executing other tasks without being blocked while these operations are being performed in the background.9

### **3.3 Other Runtimes: A Look at Node.js**

While browsers are a common runtime, server-side environments like Node.js also embed a JavaScript engine (the V8 engine).3 However, Node.js augments the engine with different APIs tailored for server-side operations, such as file system access and database interactions, rather than browser-specific APIs.3 The Node.js runtime also implements its own event loop, which uses an underlying C++ library called

libuv to manage asynchronous I/O operations.14 This demonstrates that the runtime environment is entirely separate from the language and engine, and its specific implementation determines the program's capabilities and behavior.7

## **4. The Execution Model: Single-Threaded with Concurrency**

### **4.1 The Myth and Reality of "Single-Threaded"**

JavaScript is widely described as a single-threaded language, a statement that is fundamentally true but can be misleading without proper context.8 The term "single-threaded" refers to the fact that it has only one Call Stack and can execute only one piece of code at a time in the main thread of execution.8 This synchronous nature is the reason that if a task takes a long time to complete on the Call Stack, the entire application will "freeze" or become unresponsive.17

However, the language is not a bottleneck because its surrounding ecosystem allows for a form of concurrency. This is where the seeming paradox arises: how can a single-threaded language handle multiple operations simultaneously without blocking? The solution lies not in true parallelism (running multiple tasks at the exact same time) but in a clever orchestration of concurrent operations.

### **4.2 Understanding the Synchronous Execution Flow**

The standard execution flow of a JavaScript program is synchronous.9 The engine processes the code line-by-line, and each function call is pushed onto the Call Stack and must be fully completed before the next one can be processed.9 For example, in a script with two

console.log() statements, the first one will be executed and popped off the stack before the second one is even pushed on.17 This is a simple, blocking model that is efficient for fast, sequential tasks.

### **4.3 The Asynchronous Model: Web APIs and Queues**

The non-blocking nature of JavaScript, particularly in a browser, is a direct result of its asynchronous model.9 When the Call Stack encounters a time-consuming, asynchronous operation—such as a network request or a timer—it does not block to wait for the result.17 Instead, it passes the task off to the browser's Web APIs to be handled in the background.9 Once the asynchronous operation (e.g., a timer or a data fetch) is completed, its associated callback function is not immediately pushed back onto the Call Stack.9 Instead, it is placed into a queue, where it waits for its turn to be executed.9 This "fire and forget" mechanism ensures that the main thread remains free and responsive to user input.18

## **5. The Event Loop: The Master Orchestrator of Asynchronous Behavior**

### **5.1 What is the Event Loop?**

The Event Loop is the central mechanism that allows JavaScript to manage its asynchronous tasks and provides the illusion of concurrency in a single-threaded environment.16 Operating like a manager or a control tower, the Event Loop continuously monitors the state of the Call Stack and the task queues.16 Its sole purpose is to transfer completed asynchronous callback functions from the queues to the Call Stack for execution, but only when the Call Stack is empty.9 This cyclical process ensures that tasks are handled in a non-blocking manner and that the user interface remains responsive.18

### **5.2 The Macrotask Queue (Callback Queue): A First-In, First-Out System**

The Macrotask Queue, also referred to as the Callback Queue, is where callbacks from lower-priority asynchronous operations are placed after they complete.16 This queue is a simple data structure that operates on a First-In, First-Out (FIFO) basis.9 Examples of tasks that are sent to this queue include timer functions (

setTimeout, setInterval), I/O events, and DOM events like a mouse click or a page load.16

### **5.3 The Microtask Queue: High-Priority Tasks and Their Execution**

The **Microtask Queue** is a separate, higher-priority queue that holds callbacks for promises (.then(), async/await), MutationObserver, and queueMicrotask().16 The existence of a higher-priority queue is a critical detail for understanding JavaScript's execution order. The Event Loop prioritizes the Microtask Queue over the Macrotask Queue.16 The correct and nuanced flow of execution is:

1. All synchronous code in the Call Stack is executed completely.16
2. Once the Call Stack is empty, the Event Loop processes **all** tasks in the Microtask Queue.16 If a microtask adds new microtasks to the queue, they are executed immediately within the same cycle before moving on.21
3. Only after the Microtask Queue is completely empty does the Event Loop move on to the Macrotask Queue to process the **first** task in it.16
4. The loop then repeats, with the Call Stack checking again for synchronous tasks, and then proceeding to process microtasks before moving to the next macrotask.16

This precise priority system ensures that promise-based operations are resolved before a browser repaint or a lower-priority timer callback is processed, which is crucial for building responsive and predictable applications.16

| Task Type              | Macrotask                                                                                     | Microtask                                                                                                       |
| :--------------------- | :-------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| **Priority**           | Lower                                                                                         | Higher                                                                                                          |
| **Primary Trigger**    | Timers (setTimeout, setInterval), DOM Events, I/O Operations.                                 | Promises (.then(), async/await), MutationObserver, queueMicrotask().                                            |
| **Execution Behavior** | The Event Loop processes only **one** macrotask per cycle after the microtask queue is clear. | The Event Loop processes **all** microtasks in the queue until it is empty before moving to the next macrotask. |

### **5.4 A Step-by-Step Visualization of the Event Loop Cycle**

The central narrative of the proposed visual platform will be a dynamic representation of the Event Loop's cycle. A user would input code, and a visual representation of each component would show the code's journey.

1. **Code Input:** A block labeled Source Code contains the user's script.
2. **Synchronous Execution:** A line of code animates from the Source Code block into the Call Stack. The stack visually grows and shrinks as functions are added and removed.
3. **Asynchronous Call:** When an asynchronous function like setTimeout() is encountered, it moves from the Call Stack to a Web APIs block.
4. **Background Processing:** A timer animates within the Web APIs block, simulating the background work. The Call Stack remains empty and the program continues executing any remaining synchronous code.
5. **Queueing the Callback:** Once the Web API's task is complete, its callback function is moved to the appropriate queue—for example, a Macrotask Queue block.
6. **The Event Loop's Role:** A stylized Event Loop component, represented by a cyclical arrow, constantly checks if the Call Stack is empty.
7. **Transferring the Callback:** When the Call Stack is clear, the Event Loop takes the callback from the front of the queue and pushes it onto the Call Stack, where it is finally executed.
8. **Priority-Based Animation:** The visualization would demonstrate the priority of microtasks by showing that any new promise-based callbacks are moved from the Web APIs to a separate Microtask Queue and are then cleared and executed by the Event Loop **before** the Macrotask Queue is processed.

## **6. Automatic Memory Management: The V8 Garbage Collector**

### **6.1 What is Garbage Collection?**

A critical aspect of a language's inner workings is how it manages memory.24 Unlike lower-level languages where developers must manually allocate and deallocate memory, JavaScript uses an automatic memory management feature called

**Garbage Collection (GC)**.24 The garbage collector is a program that periodically reclaims memory occupied by objects and variables that are no longer in use or accessible by the program.24 This prevents memory leaks and optimizes resource usage without any manual intervention from the developer.25

### **6.2 The Generational Hypothesis and V8's Approach**

V8's garbage collector, known as **Orinoco**, operates on a foundational principle called the **Generational Hypothesis**.26 This principle states that most objects "die young," meaning they are created and then quickly become unreachable.26 Conversely, a small number of objects survive for a long time.27

The V8 engine's memory management system is architected to exploit this hypothesis. The Memory Heap is divided into two main sections, or "generations": a **young generation** for newly created objects and an **old generation** for objects that have survived multiple collections.26 This design allows the engine to perform frequent, fast garbage collections on the young generation, where most of the work is needed, and less frequent, more thorough collections on the old generation.27

### **6.3 The Orinoco Collector: Mark-and-Sweep, Parallel Scavenging, and Compacting**

The Orinoco garbage collector uses a combination of algorithms tailored for each generation.27 For the young generation, it employs a fast

**"Scavenger"** collector.27 This is a type of semi-space collector that copies all live objects from a "from-space" to a new, empty "to-space," leaving the old space as implicitly garbage.26 This process is highly efficient and can be parallelized using helper threads to reduce the pause time for the main thread.26

For the old generation, the collector uses a slower but more comprehensive **Mark-and-Sweep** algorithm.26 This process has three phases:

1. **Marking:** The garbage collector identifies all reachable objects in the heap by traversing the object graph starting from the program's roots (global variables, etc.).24 All reachable objects are marked as "in-use".24
2. **Sweeping:** The collector then scans the entire heap and removes all unmarked objects, reclaiming their memory.24
3. **Compacting:** Optionally, the collector can defragment the memory by moving live objects together, which helps reduce memory fragmentation and improves the efficiency of future memory allocations.26

## **7. A Blueprint for Visualization and Implementation**

### **7.1 Principles for Visualizing Code Execution**

The effectiveness of the proposed platform hinges on its ability to communicate complex technical concepts with clarity and simplicity.28 The evidence suggests that visuals are far more effective than text-based explanations, with high-quality visual content leading to "74% faster memory encoding" and "clearer, more efficient communication of complex ideas".30 To build a platform that truly serves as a valuable educational tool, the design should prioritize a clear purpose, avoid excessive technical jargon, maintain a consistent style, and provide ample context.28

### **7.2 Proposed Visual Flow: A Block Diagram Approach**

A dynamic and interactive block diagram is the most effective approach for visualizing the execution flow of JavaScript code.31 Each major component identified in this report—from the Parser and the V8 pipeline to the Call Stack, Queues, and the Event Loop—can be represented by a distinct block.13 The program's execution would be animated, showing a visual representation of a line of code or a function as it moves between these blocks. For example, a line of code could animate into the "Parser" block, transform into an "AST" visual, and then flow into the "Ignition" block as it is interpreted into bytecode.

This approach provides a clear, conceptual model of the underlying processes and makes the abstract tangible. By allowing users to see the flow of their own code, the platform would provide an unparalleled educational experience.32

### **7.3 Recommendations for LLM-Based Development**

For the LLM agent tasked with developing this platform, the following recommendations derived from the research are paramount for a successful outcome:

- **Interactive Components:** The platform should not be a static image but a dynamic system. Interactive elements, such as a "Play/Pause" button, a step-by-step mode, and a code editor for user input, will be critical for user engagement and learning.32
- **Simulated Tasks:** To make the Event Loop visualization effective, the system should include simulated tasks and microtasks that appear in their respective queues and are then animated as they are moved to the Call Stack in the correct, priority-based order.21
- **Clarity and Accessibility:** The design should be simple and uncluttered, with clear labels and consistent colors to prevent confusion.28 Additionally, accessibility features such as sufficient color contrast and keyboard navigation should be a priority to make the platform usable by all audiences.28

## **Conclusion**

The power and ubiquity of the JavaScript programming language stem from a sophisticated and carefully orchestrated ecosystem. While the language's main thread of execution is single-threaded, its performance and non-blocking nature are a result of a symbiotic relationship with a highly optimized, multi-threaded engine and a feature-rich runtime environment. The Event Loop is not a mysterious component but a logical and precise mechanism that manages asynchronous behavior by carefully prioritizing and scheduling tasks, ensuring that long-running operations do not obstruct the main thread.

The proposed visual platform, built on these nuanced and precise technical insights, would serve as a groundbreaking educational tool. By translating the complex, abstract processes of parsing, JIT compilation, asynchronous queuing, and garbage collection into a clear, animated block diagram, the platform would demystify JavaScript's inner workings and empower developers with a deeper, more intuitive understanding of the language. This would move beyond simple code-writing and enable a more profound comprehension of how the language works under the hood.

#### **Works cited**

1. en.wikipedia.org, accessed September 11, 2025, https://en.wikipedia.org/wiki/JavaScript
2. A Brief History of JavaScript - DEV Community, accessed September 11, 2025, https://dev.to/dboatengx/history-of-javascript-how-it-all-began-92a
3. What is JavaScript? - JavaScript (JS) Explained - AWS, accessed September 11, 2025, https://aws.amazon.com/what-is/javascript/
4. JavaScript Engine and Runtime Explained - freeCodeCamp, accessed September 11, 2025, https://www.freecodecamp.org/news/javascript-engine-and-runtime-explained/
5. JavaScript engine - Glossary | MDN - Mozilla, accessed September 11, 2025, https://developer.mozilla.org/en-US/docs/Glossary/Engine/JavaScript
6. An introduction to JavaScript Programming and the history of JavaScript. - Launch School, accessed September 11, 2025, https://launchschool.com/books/javascript/read/introduction
7. What's the difference between JavaScript engines and JavaScript ..., accessed September 11, 2025, https://frontendmasters.com/blog/whats-the-difference-between-javascript-engines-and-javascript-runtimes/
8. How JavaScript Works: An Overview of JavaScript Engine, Heap, and Call Stack, accessed September 11, 2025, https://dev.to/bipinrajbhar/how-javascript-works-under-the-hood-an-overview-of-javascript-engine-heap-and-call-stack-1j5o
9. Understanding the JavaScript runtime environment | by Gemma Croad - Medium, accessed September 11, 2025, https://medium.com/@gemma.croad/understanding-the-javascript-runtime-environment-4dd8f52f6fca
10. JavaScript Under the Hood: Mastering the Inner Workings | Medium, accessed September 11, 2025, https://medium.com/@obrm770/javascript-under-the-hood-8cec84bbfd64
11. JavaScript Runtime Explained: All you need to know about client-side JS code execution, accessed September 11, 2025, https://dev.to/ppiippaa/javascript-runtime-explained-all-you-need-to-know-about-client-side-js-code-execution-5g8e
12. How V8 compiles JavaScript code ? - GeeksforGeeks, accessed September 11, 2025, https://www.geeksforgeeks.org/javascript/how-v8-compiles-javascript-code/
13. Introduction to JS Engines and Runtimes - AlgoDaily, accessed September 11, 2025, https://algodaily.com/lessons/introduction-to-js-engines-and-runtimes
14. How Node.js Handles Async Operations - NodeSource, accessed September 11, 2025, https://nodesource.com/blog/how-nodejs-handles-async-operations
15. groovetechnology.com, accessed September 11, 2025, https://groovetechnology.com/blog/technologies/why-javascript-is-single-threaded/
16. The JavaScript Event Loop Explained with Examples | by Frontend Highlights - Medium, accessed September 11, 2025, https://medium.com/@ignatovich.dm/the-javascript-event-loop-explained-with-examples-d8f7ddf0861d
17. Mastering the event loop: the key to asynchronous programming | by Shashank - Medium, accessed September 11, 2025, https://medium.com/design-bootcamp/mastering-the-event-loop-the-key-to-asynchronous-programming-7c90f34d3175
18. Event Loop in JavaScript - Rapidops, accessed September 11, 2025, https://www.rapidops.com/blog/event-loop-with-javascript/
19. How JavaScript's Event Loop Works: A Visual Guide | by Dinushan Sriskandaraja - Medium, accessed September 11, 2025, https://medium.com/@sridinu03/how-javascripts-event-loop-works-a-visual-guide-34a9dba3c71a
20. Unraveling Macrotasks and Microtasks in JavaScript: What Every Web Developer Should Know - DEV Community, accessed September 11, 2025, https://dev.to/bymarsel/unraveling-macrotasks-and-microtasks-in-javascript-what-every-developer-should-know-53mc
21. How the Event Loop Handles Microtasks and Macrotasks - DEV Community, accessed September 11, 2025, https://dev.to/dinhkhai0201/how-the-event-loop-handles-microtasks-and-macrotasks-4hi7
22. Using microtasks in JavaScript with queueMicrotask() - Web APIs | MDN - Mozilla, accessed September 11, 2025, https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide
23. Microtasks and event loop, accessed September 11, 2025, https://tr.javascript.info/microtask-queue
24. How does JavaScript garbage collection work? | Quiz Interview Questions with Solutions, accessed September 11, 2025, https://www.greatfrontend.com/questions/quiz/how-does-javascript-garbage-collection-work
25. Garbage Collection in JavaScript - GeeksforGeeks, accessed September 11, 2025, https://www.geeksforgeeks.org/javascript/garbage-collection-in-javascript/
26. Trash talk: the Orinoco garbage collector - V8 JavaScript engine, accessed September 11, 2025, https://v8.dev/blog/trash-talk
27. Exploring garbage collection in V8 with WebGL | William Henderson, accessed September 11, 2025, https://whenderson.dev/blog/webgl-garbage-collection/
28. The Ultimate Data Visualization Handbook for Designers | by UX Magazine | Medium, accessed September 11, 2025, https://uxmag.medium.com/the-ultimate-data-visualization-handbook-for-designers-efa7d6e0b6fe
29. Data and information visualization - Wikipedia, accessed September 11, 2025, https://en.wikipedia.org/wiki/Data_and_information_visualization
30. Canva Study: Visual Communication is the Performance Unlock for Multigenerational Teams, accessed September 11, 2025, https://www.businesswire.com/news/home/20250909581776/en/Canva-Study-Visual-Communication-is-the-Performance-Unlock-for-Multigenerational-Teams
31. Free Online Block Diagram Maker - Canva, accessed September 11, 2025, https://www.canva.com/graphs/block-diagrams/
32. EventLoop Visualized JavaScript : r/javascript - Reddit, accessed September 11, 2025, https://www.reddit.com/r/javascript/comments/1jk6zsi/eventloop_visualized_javascript/
33. Interactive figures and asynchronous programming — Matplotlib 3.10.6 documentation, accessed September 11, 2025, https://matplotlib.org/stable/users/explain/figure/interactive_guide.html
