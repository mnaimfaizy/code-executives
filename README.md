# 🚀 Code Executives: Interactive Programming Education Platform

**Code Executives** is a comprehensive, interactive web application designed to teach programming concepts through immersive visualizations and hands-on learning experiences. Built with modern web technologies, it transforms complex technical topics into engaging, visual learning journeys.

## 🌟 Features

### 📚 **Interactive Learning Modules**

- **Git Mastery**: Complete Git tutorial with 7 interactive 2D visualizations
- **JavaScript Engine**: Deep dive into V8 runtime, memory management, and execution flow
- **RxJS Reactive Programming**: Observable streams and reactive patterns
- **Data Structures**: Comprehensive guide to fundamental data structures with interactive visualizations
- **More modules coming soon**: Algorithms, system design, design patterns

### 🎮 **Interactive Visualizations**

- **2D SVG Models**: Smooth animations explaining complex concepts (20+ components)
- **3D Three.js Models**: Immersive 3D representations of programming constructs
- **Algorithm Animations**: Step-by-step execution of sorting, searching, and traversal algorithms
- **Data Structure Demos**: Interactive models for arrays, trees, graphs, and hash tables
- **Real-time Interactions**: Click, drag, and explore concepts dynamically
- **Step-by-Step Guidance**: Progressive learning with animated tutorials

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
│   │   ├── git/         # Git tutorial visualizations
│   │   └── datastructures/ # Data structure visualizations
│   ├── models3d/        # 3D visualization components
│   └── shared/          # Shared UI components
├── pages/               # Main application pages
│   ├── GitPage.tsx      # Git tutorial page
│   ├── JavaScriptPage.tsx
│   ├── RxJSPage.tsx
│   └── DataStructuresPage.tsx # Data structures module
├── sections/            # Educational content sections
│   ├── git/            # Git learning modules
│   ├── javascript/     # JavaScript concepts
│   ├── rxjs/           # RxJS tutorials
│   └── datastructures/ # Data structure concepts
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
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

To add a new learning module (following the Data Structures module pattern):

1. **Create section components** in `src/sections/[module-name]/`
2. **Add 2D visualizations** in `src/components/models2d/[module-name]/`
3. **Add 3D visualizations** in `src/components/models3d/` (if needed)
4. **Create page component** in `src/pages/[ModuleName]Page.tsx`
5. **Define TypeScript interfaces** in `src/types/[module-name].ts`
6. **Create custom hooks** in `src/hooks/use[ModuleName].ts`
7. **Update navigation** in `src/components/Header.tsx` and `src/components/Sidebar.tsx`
8. **Add routing** in `src/App.tsx`
9. **Document the module** in `docs/[Module-Name]-Implementation-Plan.md`

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

- **Three.js** community for 3D visualization capabilities
- **React** team for the amazing framework
- **Vite** for lightning-fast development experience
- **Tailwind CSS** for utility-first styling approach

## 📞 Support

- 📧 **Issues**: Report bugs or request features via GitHub Issues
- 💬 **Discussions**: Join community discussions for questions and ideas
- 📖 **Documentation**: Comprehensive docs available in the `/docs` directory

---

**Built with ❤️ for developers, by developers**

_Transform your understanding of programming concepts through interactive visualization and hands-on learning._

## 3D/2D Visualization Architecture

We use Three.js for 3D models with a modular structure under `src/three/`:

- `core/Engine.ts`: Lightweight host that creates a scene, camera, renderer, shared lights, and an animation loop. It manages model lifecycle.
- `core/types.ts`: `IModel` interface that all 3D models implement: `init(scene)`, `update(dt)`, `dispose()`.
- `core/anim.ts`: Tiny tween scheduler for simple time-based animations.
- `react/ThreeCanvas.tsx`: React bridge that mounts the engine in a div and registers provided models.
- `models/CallStackAssemblyLine.ts`: First model visualizing the Call Stack as an assembly line (conveyor + lift). Exposes `pushFrame()` and `popFrame()`.

Add a new model:

1. Create `src/three/models/MyModel.ts` implementing `IModel`.
2. Import it in a page and pass an instance to `ThreeCanvas` via `models={[new MyModel()]}`.
3. Expose imperative methods on your model (e.g., `step()`) and call them from UI buttons.
