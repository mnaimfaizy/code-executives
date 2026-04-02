# 🚀 Code Executives: Interactive Programming Education Platform

**Code Executives** is a comprehensive, interactive web application designed to teach programming concepts through immersive visualizations and hands-on learning experiences. Built with modern web technologies, it transforms complex technical topics into engaging, visual learning journeys.

**🌐 Live Website**: [https://codexecutives.com](https://codexecutives.com)

**✨ Now featuring 12 complete learning modules with 78+ interactive visualizations covering Git, JavaScript Engine, RxJS, Data Structures, Next.js, Big-O Notation, Python Programming, AI Fundamentals, Node.js Ecosystem, and a LeetCode-style playground with advanced debugging and gamification.**

> **📌 Repository Maintainers**: See [REPOSITORY-ABOUT-QUICK-REFERENCE.md](./docs/REPOSITORY-ABOUT-QUICK-REFERENCE.md) for GitHub repository About section configuration (description, website, and topics).

## 🌟 Features

### 📚 **Interactive Learning Modules**

- **Next.js Mastery**: Complete App Router tutorial with 24 interactive visualizations
- **Git Mastery**: Complete Git tutorial with 7 interactive 2D visualizations
- **JavaScript Engine**: Deep dive into V8 runtime, memory management, and execution flow
- **RxJS Reactive Programming**: Observable streams and reactive patterns
- **Data Structures**: Comprehensive guide to fundamental data structures with interactive visualizations
- **Big-O Notation**: Complete algorithmic complexity analysis with 10+ interactive tools and metaphors
- **Python Programming**: Complete Python tutorial covering philosophy, execution model, memory management, and concurrency
- **AI Fundamentals**: Machine learning concepts from scratch — neural networks, gradient descent, embeddings, and RAG pipelines
- **Node.js Ecosystem**: Deep dive into Event Loop, V8 memory, Streams, Clustering, module systems, package managers, frameworks, and runtime wars (Node vs Deno vs Bun)
- **LeetCode-Style Playground**: Interactive coding environment with debugging, visualizations, and gamification

### 🎮 **Interactive Visualizations**

- **2D SVG Models**: Smooth animations explaining complex concepts (30+ components)
- **3D Three.js Models**: Immersive 3D representations of programming constructs
- **Algorithm Animations**: Step-by-step execution of sorting, searching, and traversal algorithms
- **Data Structure Demos**: Interactive models for arrays, trees, graphs, and hash tables
- **Real-time Interactions**: Click, drag, and explore concepts dynamically
- **Step-by-Step Guidance**: Progressive learning with animated tutorials
- **Debug Visualizations**: Live data structure state during code execution

### 🎯 **LeetCode-Style Playground**

- **Interactive Coding Environment**: Monaco editor with syntax highlighting and IntelliSense
- **Step-by-Step Debugging**: Pause execution, inspect variables, and watch data structures change in real-time
- **Data Structure Visualizations**: Array, LinkedList, Queue, Stack, and HashTable with live updates
- **Performance Analysis**: Big-O complexity analysis and execution time monitoring
- **Gamification System**: Scoring, achievements, and progress tracking
- **Educational Tooltips**: Explanations for each operation and debugging concept
- **Keyboard Shortcuts**: F10 (step), F5 (continue/pause), F11 (reset), Space (pause/resume)
- **Session Persistence**: Auto-save and restore debugging sessions
- **Problem Database**: Curated coding challenges with test cases and solutions

### 🎨 **Modern User Experience**

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Themes**: Adaptive UI for comfortable learning
- **Professional UI**: Clean, modern interface built with Tailwind CSS
- **Fast Performance**: Optimized with Vite for instant feedback

## 🏗️ Architecture Overview

### **Frontend Stack**

- **Framework**: React 19 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS 4.x for utility-first styling
- **Routing**: React Router for seamless navigation
- **Icons**: Lucide React for consistent iconography

### **Visualization Technologies**

- **2D Graphics**: SVG-based interactive diagrams
- **3D Graphics**: Three.js for immersive 3D models
- **Animations**: CSS transitions and JavaScript-driven animations
- **Interactivity**: Mouse/touch events with real-time feedback

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── models2d/        # 2D visualization components
│   │   ├── nextjs/      # Next.js tutorial visualizations (24 components)
│   │   ├── git/         # Git tutorial visualizations
│   │   ├── javascript/  # JavaScript engine visualizations
│   │   ├── rxjs/        # RxJS reactive programming visualizations
│   │   ├── datastructures/ # Data structure visualizations
│   │   │   ├── hash/    # HashTable visualization
│   │   ├── bigo/        # Big-O notation visualizations (10+ components)
│   │   └── python/      # Python programming visualizations
│   ├── models3d/        # 3D visualization components
│   │   └── python/      # Python 3D models (VM, memory profiler, call graph)
│   ├── playground/      # LeetCode-style playground components
│   │   ├── Playground.tsx          # Main playground component
│   │   ├── ProblemDisplay.tsx      # Problem statement and examples
│   │   ├── CodeEditor.tsx          # Monaco-based code editor
│   │   ├── VisualizationSelector.tsx # Data structure selection
│   │   ├── TestRunner.tsx          # Test case execution
│   │   ├── PerformanceAnalyzer.tsx # Big-O analysis
│   │   ├── ExecutionEngine.tsx     # Advanced debugging engine
│   │   └── ScoringSystem.tsx       # Gamification system
│   └── shared/          # Shared UI components
├── pages/               # Main application pages
│   ├── NextjsPage.tsx   # Next.js tutorial page
│   ├── GitPage.tsx      # Git tutorial page
│   ├── JavaScriptPage.tsx
│   ├── RxJSPage.tsx
│   ├── DataStructuresPage.tsx # Data structures module with playground
│   ├── BigOPage.tsx     # Big-O notation module with playground
│   └── PythonPage.tsx   # Python programming module
├── sections/            # Educational content sections
│   ├── nextjs/          # Next.js learning modules (7 sections)
│   ├── git/            # Git learning modules
│   ├── javascript/     # JavaScript concepts
│   ├── rxjs/           # RxJS tutorials
│   ├── datastructures/ # Data structure concepts
│   ├── bigo/           # Big-O notation concepts (8 sections)
│   └── python/         # Python programming concepts (5 sections)
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
│   ├── nextjs.ts       # Next.js type definitions
│   ├── datastructures.ts # Data structures type definitions
│   ├── bigo.ts         # Big-O notation type definitions
│   ├── python.ts       # Python programming type definitions
│   └── playground.ts   # Playground type definitions
├── utils/              # Utility functions
│   ├── instrument.ts   # Code instrumentation for debugging
│   ├── memoryMonitor.ts # Performance monitoring
│   └── theme.ts        # Theme and styling utilities
├── data/               # Static data and problem sets
│   └── problems.ts     # LeetCode-style coding problems
└── three/              # Three.js 3D models and scenes
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** or **yarn** package manager
- Modern web browser with ES2020+ support

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd code-executives
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
# or
yarn build
```

The built application will be in the `dist/` directory.

### 🌐 Deploying to cPanel (Apache)

Code Executives is a **Single Page Application (SPA)** that uses client-side routing via React Router. When deployed on a traditional Apache/cPanel host, you need to tell Apache to serve `index.html` for every URL so that React Router can handle navigation. Without this step, directly visiting any URL (e.g. `https://codexecutives.com/javascript`) will return a **404 error** because Apache looks for a physical file at that path.

**This repository already includes the required `.htaccess` file** (`public/.htaccess`) which Vite automatically copies to `dist/` on every build.

#### Step-by-step cPanel deployment

1. **Build the application**

   ```bash
   npm run build
   ```

   The `dist/` folder now contains the complete production bundle, including the `.htaccess` file.

2. **Upload `dist/` contents to your public_html directory**

   Using cPanel's File Manager or FTP, upload **all files and folders** inside `dist/` (not the folder itself) to your domain's `public_html` directory (or the sub-directory you are deploying to).

   > ⚠️ Make sure to upload hidden files as well — the `.htaccess` file starts with a dot and can be invisible in some FTP clients. Enable "Show Hidden Files" in cPanel File Manager.

3. **Verify `mod_rewrite` is enabled**

   The `.htaccess` relies on Apache's `mod_rewrite` module. Most cPanel hosts have this enabled by default. If you still see 404 errors after uploading, contact your host to confirm `mod_rewrite` is active.

4. **Test direct URL access**

   Open your browser and navigate directly to a deep URL such as `https://yourdomain.com/javascript` or `https://yourdomain.com/git`. The page should load correctly via React Router.

#### How the `.htaccess` works

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```

- Requests for **real files** (JS/CSS chunks, images, fonts) are served directly.
- All other requests are **internally rewritten** to `index.html`, letting React Router decide what to render.

> **No Node.js server is required.** The application is a fully static bundle that works with any web server capable of serving static files.

## 🎓 Learning Modules

### 📚 **Git Tutorial (Complete)**

Master Git version control with interactive visualizations:

- **Repository Architecture**: Understanding Git's internal structure
- **Three-Tree Model**: Working directory, staging area, and commit history
- **Object Model**: Blobs, trees, commits, and references
- **Core Workflow**: Add, commit, push, pull operations
- **Branching & Merging**: Feature branches and merge strategies
- **Collaboration**: Remote repositories and team workflows
- **History Management**: Rebase, reset, and advanced Git operations

### ⚡ **JavaScript Engine**

Deep dive into how JavaScript actually works:

- **V8 Runtime**: Chrome's JavaScript engine internals
- **Call Stack**: Function execution and stack frames
- **Memory Heap**: Object allocation and garbage collection
- **Event Loop**: Asynchronous execution and task queues
- **Memory Management**: Leak detection and optimization

### 🔄 **RxJS Reactive Programming**

Master reactive programming patterns:

- **Observables**: Data streams and subscription patterns
- **Operators**: Transform, filter, and combine streams
- **Error Handling**: Robust error management strategies
- **Real-world Examples**: Practical applications and use cases

### 🏗️ **Data Structures (Complete)**

Comprehensive guide to fundamental data structures with interactive visualizations:

- **Linear Structures**: Arrays, linked lists, stacks, and queues
- **Hash Tables**: Hash functions, collision resolution, and performance analysis
- **Tree Structures**: Binary trees, BSTs, AVL trees, red-black trees, heaps, and B-trees
- **Graph Structures**: Graph representations, BFS/DFS traversals, and shortest path algorithms
- **3D Visualizations**: Interactive 3D models for complex data structure relationships
- **Practice Problems**: LeetCode-style coding challenges with step-by-step solutions
- **Real-world Applications**: Industry use cases from social media to database systems
- **Performance Analysis**: Big O notation, complexity comparisons, and optimization strategies

### ⚛️ **Next.js Mastery (Complete)**

Complete App Router tutorial with 24 interactive visualizations covering modern Next.js development:

- **App Router Fundamentals**: File-system routing, nested layouts, and shared UI patterns
- **Rendering Strategies**: SSR, SSG, CSR, ISR with performance comparisons and Core Web Vitals
- **Server & Client Components**: Component composition, hydration flow, and code splitting
- **Data Fetching & Mutations**: Server Actions, caching strategies, and request memoization
- **Middleware & Route Handlers**: Request processing pipeline, edge runtime, and API routes
- **Performance Optimization**: Bundle analysis, image optimization, and caching strategies
- **Interactive Visualizations**: 24+ components including flow diagrams, performance dashboards, and code playgrounds
- **Real-world Patterns**: Progressive enhancement, error boundaries, and production best practices

### 📊 **Big-O Notation Mastery (Complete)**

Complete algorithmic complexity analysis module with 10+ interactive tools and educational metaphors:

- **Core Concepts**: Understanding time and space complexity with intuitive visualizations
- **Common Complexities**: Interactive exploration of O(1), O(log n), O(n), O(n log n), O(n²), O(2^n), O(n!) complexities
- **Algorithm Analysis**: Step-by-step complexity analysis with code visualization and performance profiling
- **Real-World Applications**: 3D complexity landscape showing algorithms in complexity space with industry case studies
- **Advanced Topics**: Amortized analysis, complexity hierarchies, and optimization techniques
- **Practice Challenges**: Interactive coding challenges with Big-O analysis and performance comparisons
- **Gamification Hub**: Achievement system with progress tracking and learning milestones
- **Interactive Metaphors**: 10+ visual metaphors including teleporter, librarian, conveyor belt, turtle, population explosion, and combinatorial explosion
- **Algorithm Comparison**: Side-by-side performance analysis with real-time execution simulation
- **Performance Profiling**: Code analyzer and optimization coach with complexity recommendations

### 🐍 **Python Programming Mastery (Complete)**

Complete Python tutorial covering the fundamental concepts that make Python unique, from philosophy to practical implementation:

- **Python Philosophy**: The Zen of Python (PEP 20) with 19 guiding principles, interactive principle exploration, and Pythonic vs non-Pythonic code comparisons
- **Execution Model**: Interactive 3-phase execution flow (Source → Bytecode → PVM) with step-by-step compilation visualization and bytecode examples
- **Memory Management**: Interactive reference counting demo and cyclic garbage collection visualization showing object lifecycle and memory allocation strategies
- **Global Interpreter Lock**: Interactive threading demo showing GIL behavior, thread blocking, and alternatives like multiprocessing and asyncio
- **Advanced Concepts**: Generators, decorators, metaclasses, and context managers with interactive visualizations
- **2D Visualizations**: Execution flow diagrams, memory models, GIL threading demonstrations, and decorator patterns
- **3D Visualizations**: Python VM internals, memory profiler, and call graph representations
- **Performance Analysis**: GIL impact, memory optimization, and concurrency alternatives
- **Real-world Applications**: Best practices for CPU-bound vs I/O-bound tasks, memory profiling, and optimization techniques

### 🤖 **AI Fundamentals (Complete)**

Master machine learning concepts from the ground up with interactive visualizations and beginner-friendly explanations:

- **Introduction to AI/ML**: Core concepts, history, and the difference between AI, ML, and deep learning — with ELI10 analogies
- **ML Lifecycle**: End-to-end machine learning pipeline from data collection to model deployment
- **Feature Engineering**: Transforming raw data into meaningful inputs — normalization, encoding, and selection
- **Neural Networks**: How neurons, layers, and activation functions work — interactive forward pass visualization
- **Loss Functions**: Understanding MSE, cross-entropy, and how models measure their own mistakes
- **Gradient Descent**: Intuitive step-by-step visualization of how models learn by minimizing loss
- **Backpropagation**: Chain rule demystified — interactive gradient flow through a neural network
- **Generalization**: Overfitting, underfitting, bias-variance tradeoff, and regularization techniques
- **Training vs Inference**: The distinction between learning and prediction, with batch/online learning modes
- **Word Embeddings**: Turning text into vectors — Word2Vec, cosine similarity, and semantic relationships
- **RAG Pipeline**: Retrieval-Augmented Generation — grounding LLMs with external knowledge stores
- **Beginner Friendly**: Every section includes ELI10 boxes, real-world analogies, and key takeaways
- **11 Interactive Sections**: Progressive visualizations guiding learners from zero ML knowledge to RAG pipelines

### 🎯 **LeetCode-Style Playground (Complete)**

Interactive coding environment that transforms algorithm learning through visual debugging and gamification:

- **Interactive Problem Solving**: Curated coding challenges with real-time test case validation and performance analysis
- **Advanced Debugging Engine**: Step-by-step execution with pause/resume, variable inspection, and call stack visualization
- **Live Data Structure Visualization**: Watch arrays, linked lists, stacks, queues, and hash tables change in real-time during execution
- **Educational Debugging**: Comprehensive tooltips explaining each operation, data structure behavior, and algorithmic concepts
- **Keyboard Shortcuts**: Professional debugging experience with F10 (step), F5 (continue/pause), F11 (reset), and Space (pause/resume)
- **Performance Monitoring**: Real-time Big-O complexity analysis, memory usage tracking, and execution time profiling
- **Gamification System**: Achievement unlocks, scoring system, and progress tracking to motivate learning
- **Session Persistence**: Auto-save debugging sessions and restore work across browser sessions
- **Multiple Data Structures**: Complete implementations with collision handling, hash calculations, and performance comparisons
- **Code Instrumentation**: Advanced code analysis with function call/return tracking and operation-level insights

## 🛠️ Development

### **Available Scripts**

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production-ready bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint code quality checks
- `npm run type-check` - Run TypeScript type checking

### **Code Quality**

The project maintains high code quality through:

- **TypeScript**: Static type checking for safer development
- **ESLint**: Code linting with React and TypeScript rules
- **Prettier**: Consistent code formatting (recommended)
- **Modular Architecture**: Clean separation of concerns

### **Adding New Modules**

To add a new learning module (following the Next.js, Data Structures, and Big-O Notation module patterns):

1. **Create implementation plan** in `docs/[Module-Name]-Implementation-Plan.md`
2. **Define TypeScript interfaces** in `src/types/[module-name].ts`
3. **Create section components** in `src/sections/[module-name]/`
4. **Add 2D visualizations** in `src/components/models2d/[module-name]/`
5. **Add 3D visualizations** in `src/components/models3d/` (if needed)
6. **Create page component** in `src/pages/[ModuleName]Page.tsx`
7. **Create custom hooks** in `src/hooks/use[ModuleName].ts`
8. **Update theme colors** in `src/utils/theme.ts`
9. **Update navigation** in `src/components/Header.tsx` and `src/components/Sidebar.tsx`
10. **Add routing** in `src/App.tsx`
11. **Update README.md** with module information

## 🤝 Contributing

We welcome contributions! This project is designed to be educational and community-driven.

### **Getting Started**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the existing patterns
4. Test your changes thoroughly
5. Commit with descriptive messages
6. Push to your branch and create a Pull Request

### **Contribution Guidelines**

- Follow the existing code style and architecture
- Add TypeScript types for all new code
- Include interactive visualizations where applicable
- Write descriptive commit messages
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the incredible App Router and modern React framework
- **Three.js** community for 3D visualization capabilities
- **React** team for the amazing framework ecosystem
- **Vite** for lightning-fast development experience
- **Tailwind CSS** for utility-first styling approach
- **Monaco Editor** for the professional code editing experience in the playground
- **Vercel** for hosting and deployment platform
- **Open Source Community** for the tools and libraries that make this possible

## 📞 Support

- 📧 **Issues**: Report bugs or request features via GitHub Issues
- 💬 **Discussions**: Join community discussions for questions and ideas
- 📖 **Documentation**: Comprehensive docs available in the `/docs` directory
- 🎓 **Learning Modules**: 8 complete interactive modules with 80+ visualizations
- 🎯 **Playground**: LeetCode-style coding environment with debugging and gamification

---

**Built with ❤️ for developers, by developers**

_Transform your understanding of programming concepts through interactive visualization and hands-on learning. Master modern web development with our comprehensive Next.js, Git, JavaScript, RxJS, Data Structures, Big-O Notation, Python Programming, and AI Fundamentals modules. Practice algorithms with our LeetCode-style playground featuring advanced debugging, real-time visualizations, and gamification._

## 3D/2D Visualization Architecture

We use Three.js for 3D models with a modular structure under `src/three/`:

- `core/Engine.ts`: Lightweight host that creates a scene, camera, renderer, shared lights, and an animation loop. It manages model lifecycle.
- `core/types.ts`: `IModel` interface that all 3D models implement: `init(scene)`, `update(dt)`, `dispose()`.
- `core/anim.ts`: Tiny tween scheduler for simple time-based animations.
- `react/ThreeCanvas.tsx`: React bridge that mounts the engine in a div and registers provided models.
- `models/CallStackAssemblyLine.ts`: First model visualizing the Call Stack as an assembly line (conveyor + lift). Exposes `pushFrame()` and `popFrame()`.
- `models/python/PythonVM3D.ts`: 3D visualization of Python Virtual Machine internals and execution flow.
- `models/python/MemoryProfiler3D.ts`: Interactive 3D memory heap visualization with object allocation tracking.
- `models/python/CallGraph3D.ts`: 3D representation of Python function call relationships and execution paths.

Add a new model:

1. Create `src/three/models/MyModel.ts` implementing `IModel`.
2. Import it in a page and pass an instance to `ThreeCanvas` via `models={[new MyModel()]}`.
3. Expose imperative methods on your model (e.g., `step()`) and call them from UI buttons.
