# GitHub Copilot Instructions for Code Executives

## 🎯 Project Overview

**Code Executives** is an interactive programming education platform that transforms complex technical concepts into engaging visual learning experiences. The application uses React, TypeScript, and modern web technologies to create immersive educational content through 2D/3D visualizations.

### **Quick Reference**

- **Technology Stack**: React 19 + TypeScript + Vite + Tailwind CSS 4.x + Three.js
- **Project Type**: Educational platform with 10 interactive learning modules
- **Architecture**: Feature-based organization with shared infrastructure
- **Testing**: Vitest + React Testing Library (76 tests across shared components)
- **Code Quality**: ESLint + Prettier + TypeScript strict mode
- **Dev Server**: `npm run dev` → http://localhost:5173
- **Build**: `npm run build` (TypeScript + Vite)
- **Test**: `npm test` (watch mode) or `npm run test:run` (CI mode)

### **10 Learning Modules**

1. JavaScript Engine - V8 internals and execution flow
2. RxJS - Reactive programming with observables
3. Git - Version control with interactive visualizations
4. Data Structures - Arrays, trees, graphs with animations
5. React - Component patterns and hooks
6. Next.js - App Router and rendering strategies
7. Big-O Notation - Complexity analysis with gamification
8. Python - Language fundamentals and VM internals
9. System Design - Architecture patterns and scalability
10. TypeScript - Type system and advanced patterns

## 🏗️ Architecture Principles

### **Core Technologies**

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4.x with utility-first approach
- **Routing**: React Router v7 for SPA navigation
- **Visualizations**: SVG for 2D models, Three.js for 3D scenes
- **Icons**: Lucide React for consistent iconography
- **Testing**: Vitest + React Testing Library
- **Code Editing**: Monaco Editor (for playground)
- **SEO**: @dr.pogodin/react-helmet for meta tags

### **Architecture Patterns**

- **Feature-Based Organization**: Each learning module is self-contained in `src/features/`
- **Shared Infrastructure**: Common utilities, components, and hooks in `src/shared/`
- **Lazy Loading**: All feature pages are code-split with `React.lazy()`
- **Error Boundaries**: Multiple levels (app, page, feature) for graceful error handling
- **Context Providers**: Theme, UI state, and app-level state management
- **Performance Monitoring**: Built-in performance dashboard for development
- **Analytics**: Optional Google Analytics integration via shared services

### **Project Structure Philosophy**

```
src/
├── features/              # Feature-based modules (10 learning modules)
│   ├── javascript/        # JavaScript Engine module
│   ├── rxjs/              # RxJS Reactive Programming module
│   ├── git/               # Git Tutorial module
│   ├── datastructures/    # Data Structures module
│   ├── react/             # React.js module
│   ├── nextjs/            # Next.js module
│   ├── bigo/              # Big-O Notation module
│   ├── python/            # Python Programming module
│   ├── systemdesign/      # System Design module
│   └── typescript/        # TypeScript module
│   └── [feature]/
│       ├── components/
│       │   ├── sections/        # Educational content sections
│       │   └── visualizations/  # 2D/3D interactive models
│       │       ├── 2d/          # SVG-based visualizations
│       │       └── 3d/          # Three.js models (optional)
│       ├── hooks/               # Feature-specific hooks
│       └── index.tsx            # Feature entry point (Page component)
├── shared/                # Shared utilities across all features
│   ├── components/        # Reusable UI components
│   │   ├── feedback/      # ErrorBoundary, Toast, LoadingFallback, Skeleton
│   │   ├── navigation/    # Breadcrumbs, ProgressIndicator
│   │   ├── routing/       # SuspenseRoute
│   │   ├── accessibility/ # SkipLinks, ARIA utilities
│   │   ├── performance/   # PerformanceDashboard, PerformanceProfiler
│   │   ├── layout/        # Layout components
│   │   └── SEO/           # SEO component with react-helmet
│   ├── contexts/          # React Context providers (Theme, UI, App)
│   ├── services/          # Analytics, monitoring services
│   └── hooks/             # Shared custom hooks (useDebounce, useThrottle, etc.)
├── components/            # Global components (Header, Footer, Sidebar)
├── pages/                 # Legacy page components (Home, About)
├── core/                  # Core configuration
│   └── config/            # Environment and app configuration
├── data/                  # Static data (problems, examples)
├── hooks/                 # Legacy global hooks
├── types/                 # TypeScript type definitions
├── utils/                 # Pure utility functions (theme.ts)
├── three/                 # Three.js engine and models
│   ├── core/              # Engine, types, animation scheduler
│   ├── models/            # 3D model implementations
│   └── react/             # React bridge (ThreeCanvas)
├── assets/                # Static assets (images, fonts)
└── test/                  # Test utilities and setup
```

## 🎨 Design System Guidelines

### **Theme System**

**⚠️ Important**: Code Executives operates exclusively in light mode. All dark theme functionality has been completely removed from the application. Use only light theme colors and classes.

### **Shared Theme System**

Code Executives uses a comprehensive shared theme system located in `src/utils/theme.ts` to ensure design consistency across all sections, pages, and components.

#### **Color Schemes by Section**

All 10 learning modules have dedicated color schemes in `src/utils/theme.ts`:

- **JavaScript**: Indigo/Purple/Blue theme (`theme.colors.javascript`)
- **Git**: Orange/Red/Pink theme (`theme.colors.git`)
- **Data Structures**: Blue/Indigo/Purple theme (`theme.colors.datastructures`)
- **RxJS**: Purple/Violet/Indigo theme (`theme.colors.rxjs`)
- **React**: Blue/Indigo/Cyan theme (`theme.colors.react`)
- **Next.js**: Blue/Indigo/Cyan theme (`theme.colors.nextjs`)
- **Big-O**: Emerald/Teal/Cyan theme (`theme.colors.bigo`)
- **Python**: Blue/Indigo/Cyan theme (`theme.colors.python`)
- **System Design**: Blue/Indigo/Purple theme (`theme.colors.systemdesign`)
- **TypeScript**: Indigo/Purple/Blue theme (`theme.colors.typescript`)
- **Playground**: Blue/Indigo/Purple theme (`theme.colors.playground`)

#### **Shared Components**

Use these pre-built shared components for consistency (located in `src/shared/components/`):

```typescript
// Feedback Components
import { ErrorBoundary } from '../shared/components/feedback/ErrorBoundary';
import { Toast, ToastProvider } from '../shared/components/feedback/Toast';
import { LoadingFallback } from '../shared/components/feedback/LoadingFallback';
import { Skeleton } from '../shared/components/feedback/Skeleton';

// Navigation Components
import { Breadcrumbs } from '../shared/components/navigation/Breadcrumbs';
import { ProgressIndicator } from '../shared/components/navigation/ProgressIndicator';

// Routing Components
import { SuspenseRoute } from '../shared/components/routing';

// Accessibility Components
import { SkipLinks } from '../shared/components/accessibility';

// Performance Components
import { PerformanceDashboard } from '../shared/components/performance';

// SEO Components
import { SEO } from '../shared/components/SEO';

// Context Providers
import { UIProvider, ThemeProvider, AppProvider } from '../shared/contexts';

// Usage Example with Feature Module
<ErrorBoundary level="feature">
  <SuspenseRoute>
    <YourFeatureComponent />
  </SuspenseRoute>
</ErrorBoundary>
```

#### **Standard Section Structure**

All feature modules follow this consistent pattern using the features-based architecture:

```typescript
// src/features/[module]/index.tsx
import React from 'react';
import { SEO } from '../../shared/components/SEO';
import { ErrorBoundary } from '../../shared/components/feedback/ErrorBoundary';

const ModulePage: React.FC = () => {
  return (
    <ErrorBoundary level="page">
      <SEO
        title="Module Title - Code Executives"
        description="Module description"
        keywords={['keyword1', 'keyword2']}
      />
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl p-8 border border-blue-100 shadow-lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Module Title</h1>
          <p className="text-xl text-gray-700 leading-relaxed">Description</p>
        </section>

        {/* Content Sections */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Educational content and visualizations */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Navigation cards, resources */}
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
};

export default ModulePage;
```

### **Component Patterns**

1. **Functional Components**: Always use function components with hooks
2. **TypeScript First**: All components must have proper TypeScript interfaces
3. **Props Interface**: Create explicit interfaces for all component props
4. **Tailwind Classes**: Use Tailwind utilities, avoid custom CSS when possible
5. **Responsive Design**: Mobile-first approach with responsive breakpoints

### **Animation Standards**

- **2D Visualizations**: Use CSS transitions and SVG animations
- **Interactive Elements**: Hover states, click feedback, smooth transitions
- **State Management**: Use `useState` and `useEffect` for animation timing
- **Performance**: Optimize animations for 60fps, use `transform` properties

### **Typography Scale**

- **H1**: `text-4xl font-bold` (Hero titles)
- **H2**: `text-3xl font-bold` (Section headers)
- **H3**: `text-2xl font-bold` (Card titles)
- **H4**: `text-xl font-bold` (Subsection headers)
- **Body**: `text-gray-700 leading-relaxed` (Regular text)
- **Caption**: `text-sm text-gray-600` (Small text)

#### **Theme Utility Functions**

```typescript
// Get section-specific theme
const theme = getSectionTheme('javascript'); // Returns indigo/purple/blue colors

// Create consistent card classes
const cardClass = createCardClass(); // Basic card
const hoverCardClass = createCardClass('hover'); // Card with hover effects

// Create navigation cards
const navClass = createNavCardClass('indigo'); // indigo-200 bg-indigo-50 hover:bg-indigo-100

// Create buttons
const primaryButton = createButtonClass('primary'); // Blue primary button
const secondaryButton = createButtonClass('secondary'); // Gray secondary button

// Create CTA sections
const ctaClass = createCTAClass('indigo'); // Gradient background for CTAs
```

#### **Adding New Sections**

When adding a new learning module, follow these steps:

1. **Create Feature Directory Structure** in `src/features/[module]/`:

```bash
src/features/[module]/
├── components/
│   ├── sections/         # Educational content components
│   └── visualizations/   # Interactive 2D/3D visualizations
│       ├── 2d/           # SVG-based components
│       └── 3d/           # Three.js models (optional)
├── hooks/                # Feature-specific custom hooks (optional)
└── index.tsx             # Main page component (entry point)
```

2. **Add Color Scheme** to `theme.colors` in `src/utils/theme.ts`:

```typescript
colors: {
  newsection: {
    primary: 'emerald',
    secondary: 'teal',
    accent: 'cyan',
    gradient: 'from-emerald-50 via-white to-teal-50',
    border: 'emerald-100',
    shadow: 'emerald-200',
  },
}
```

3. **Create Main Page Component** (`src/features/[module]/index.tsx`)
4. **Update Navigation** in `src/components/Header.tsx` and `src/components/Sidebar.tsx`
5. **Add Routing** in `src/App.tsx`:

```typescript
// Import
const NewModulePage = lazy(() => import('./features/newmodule'));

// Route
<Route
  path="/newmodule"
  element={
    <SuspenseRoute>
      <NewModulePage />
    </SuspenseRoute>
  }
/>
```

6. **Add Type Definitions** in `src/types/[module].ts` (if needed)
7. **Update README.md** with module information

#### **Educational Content Structure**

Each learning module follows this pattern:

```typescript
interface EducationalSection {
  title: string;
  description: string;
  visualization: React.ComponentType;
  content: {
    introduction: string;
    keyPoints: string[];
    interactiveDemo?: React.ComponentType;
    furtherReading?: string[];
  };
}
```

## 🧩 Component Development Guidelines

### **Feature Module Structure**

All learning modules are organized under `src/features/[module]/`:

```typescript
// src/features/[module]/index.tsx - Main page component
import React from 'react';
import { SEO } from '../../shared/components/SEO';

const ModulePage: React.FC = () => {
  return (
    <>
      <SEO title="Module Title" description="Description" />
      {/* Module content */}
    </>
  );
};

export default ModulePage;
```

### **2D Visualization Components (src/features/[module]/components/visualizations/2d/)**

```typescript
interface Visualization2DProps {
  isActive?: boolean;
  animationStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

// Example structure for 2D components
const MyVisualization2D: React.FC<Visualization2DProps> = ({
  isActive = false,
  animationStep = 0,
  onStepChange,
  className = ""
}) => {
  // Animation state management
  const [currentStep, setCurrentStep] = useState(animationStep);

  // Interactive handlers
  const handleElementClick = (elementId: string) => {
    // Update animation state
    // Trigger visual feedback
  };

  return (
    <div className={`relative w-full h-96 ${className}`}>
      <svg viewBox="0 0 800 400" className="w-full h-full">
        {/* SVG content with animations */}
      </svg>
    </div>
  );
};
```

### **Educational Section Components (src/features/[module]/components/sections/)**

```typescript
interface SectionProps {
  isActive?: boolean;
  onNavigate?: (sectionId: string) => void;
}

const EducationalSection: React.FC<SectionProps> = ({ isActive, onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Educational content */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Section Title
          </h2>
          <div className="prose max-w-none">
            {/* Educational content */}
          </div>
        </div>

        {/* Right: Interactive visualization */}
        <div className="space-y-4">
          <VisualizationComponent isActive={isActive} />
          <div className="flex gap-2">
            {/* Demo controls */}
          </div>
        </div>
      </div>
    </div>
  );
};
```

### **3D Visualization Components (src/three/models/)**

For 3D visualizations using Three.js:

1. Create model in `src/three/models/[Module]/[ModelName].ts` implementing `IModel` interface
2. Model must implement: `init(scene)`, `update(dt)`, `dispose()`
3. Use `ThreeCanvas` from `src/three/react/ThreeCanvas.tsx` to render in React
4. Expose imperative methods for UI interaction

```typescript
// src/three/models/MyModule/MyModel3D.ts
import { IModel } from '../../core/types';
import * as THREE from 'three';

export class MyModel3D implements IModel {
  private mesh: THREE.Mesh | null = null;

  init(scene: THREE.Scene): void {
    // Initialize 3D objects
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x0066ff });
    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);
  }

  update(deltaTime: number): void {
    // Update animation
    if (this.mesh) {
      this.mesh.rotation.y += deltaTime;
    }
  }

  dispose(): void {
    // Cleanup
    if (this.mesh) {
      this.mesh.geometry.dispose();
      (this.mesh.material as THREE.Material).dispose();
    }
  }
}
```

## 🎮 Interactive Features Standards

### **Demo Controls Pattern**

All interactive visualizations should include:

- **Play/Pause**: Start/stop animations
- **Step Controls**: Next/Previous step navigation
- **Reset**: Return to initial state
- **Speed Control**: Adjust animation timing

### **State Management for Visualizations**

```typescript
// Use this pattern for complex visualization state
interface VisualizationState {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
  elements: VisualizationElement[];
}

const useVisualizationState = (initialState: VisualizationState) => {
  const [state, setState] = useState(initialState);

  const play = () => setState((prev) => ({ ...prev, isPlaying: true }));
  const pause = () => setState((prev) => ({ ...prev, isPlaying: false }));
  const nextStep = () =>
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.totalSteps - 1),
    }));

  return { state, play, pause, nextStep };
};
```

## 🔧 Shared Infrastructure

### **Context Providers**

The application uses React Context for global state management:

```typescript
// From src/shared/contexts
import { AppProvider } from './shared/contexts/AppContext';      // App-level state
import { ThemeProvider } from './shared/contexts/ThemeContext';  // Theme preferences
import { UIProvider } from './shared/contexts/UIContext';        // UI state (sidebar, modals)

// Usage in App.tsx
<AppProvider>
  <ThemeProvider>
    <UIProvider>
      {/* Your app */}
    </UIProvider>
  </ThemeProvider>
</AppProvider>
```

### **Services**

Shared services for cross-cutting concerns:

```typescript
// Analytics Service (src/shared/services/analytics)
import analyticsService from './shared/services/analytics';

// Initialize in App.tsx
analyticsService.initialize(googleAnalyticsId);

// Track page views
analyticsService.trackPageView('/module-name');

// Track custom events
analyticsService.trackEvent('feature_used', { feature: 'visualization' });
```

### **Environment Configuration**

```typescript
// src/core/config/env.ts
import { env } from './core/config/env';

// Available environment variables
env.enableAnalytics      // boolean
env.googleAnalyticsId    // string | undefined
env.isDevelopment        // boolean
env.isProduction         // boolean

// Access in components
import.meta.env.DEV      // Vite development mode
import.meta.env.PROD     // Vite production mode
```

## 📚 Module-Specific Guidelines

### **All 10 Learning Modules**

The application includes these complete learning modules:

1. **JavaScript Engine** (`src/features/javascript/`)
   - V8 runtime internals and execution flow
   - Call stack, memory heap, event loop visualizations
   - Memory management and garbage collection

2. **RxJS Reactive Programming** (`src/features/rxjs/`)
   - Observable streams and operators
   - Marble diagrams and data flow visualizations
   - Error handling patterns

3. **Git Tutorial** (`src/features/git/`)
   - Three-tree model and object model
   - Branching, merging, and collaboration workflows
   - Use green for staged, blue for committed, red for conflicts

4. **Data Structures** (`src/features/datastructures/`)
   - Linear structures, hash tables, trees, graphs
   - Interactive visualizations and algorithm animations
   - LeetCode-style practice problems

5. **React.js** (`src/features/react/`)
   - React fundamentals and component patterns
   - Hooks, context, and state management
   - Performance optimization techniques

6. **Next.js** (`src/features/nextjs/`)
   - App Router architecture and file-system routing
   - Rendering strategies (SSR, SSG, CSR, ISR)
   - Server/Client components and data fetching

7. **Big-O Notation** (`src/features/bigo/`)
   - Algorithmic complexity analysis
   - Interactive complexity comparisons
   - Visual metaphors and gamification

8. **Python Programming** (`src/features/python/`)
   - Zen of Python and execution model
   - Memory management and GIL
   - 3D visualizations of Python VM

9. **System Design** (`src/features/systemdesign/`)
   - System architecture patterns
   - Scalability and reliability concepts
   - Real-world case studies

10. **TypeScript** (`src/features/typescript/`)
    - Type system fundamentals
    - Advanced types and generics
    - Best practices and patterns

### **Visualization Guidelines by Module**

- **Git**: Use consistent color coding (green=staged, blue=committed, red=conflicts)
- **JavaScript**: Use kitchen metaphor for event loop, library for memory heap
- **RxJS**: Use marble diagrams extensively for data streams
- **Data Structures**: Show step-by-step algorithm execution
- **Big-O**: Use visual metaphors (teleporter, librarian, conveyor belt)
- **Python**: 3D models for VM internals and memory profiler

## 🚨 Code Quality Standards

### **TypeScript Requirements**

- All functions must have explicit return types
- Use strict type checking (`strict: true` in tsconfig)
- Prefer interfaces over types for object shapes
- Use generic types for reusable components
- No implicit `any` types allowed
- Import types with `import type` when possible

### **ESLint Configuration**

The project uses:
- `@typescript-eslint` for TypeScript-specific rules
- `eslint-plugin-react` and `eslint-plugin-react-hooks` for React best practices
- `eslint-plugin-import` for import organization
- `eslint-config-prettier` to avoid conflicts with Prettier

Run `npm run lint` to check for issues, `npm run lint:fix` to auto-fix.

### **Performance Guidelines**

- **Code Splitting**: Lazy load heavy components with `React.lazy()`
- **SVG Optimization**: Use `will-change` CSS property for animations
- **Memoization**: Use `useMemo` and `useCallback` for expensive computations
- **Re-render Prevention**: Proper dependency arrays in hooks
- **Bundle Analysis**: Available via `rollup-plugin-visualizer` in build
- **Performance Monitoring**: Use `PerformanceDashboard` in development

### **Accessibility Standards**

- All interactive elements must be keyboard accessible
- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, etc.)
- Include ARIA labels for complex visualizations
- Ensure color contrast meets WCAG 2.1 AA standards
- Support reduced motion preferences with `useReducedMotion` hook
- Include skip links for keyboard navigation
- Test with screen readers when possible

### **Code Formatting**

- **Prettier**: Run `npm run format` to format all files
- **EditorConfig**: Maintains consistent coding styles
- **Conventions**:
  - Use 2 spaces for indentation
  - Use single quotes for strings
  - Add trailing commas in multiline objects/arrays
  - Max line length: 100 characters (recommended)

## 🛠️ Development Workflow

### **Available Scripts**

```bash
# Development
npm run dev              # Start development server (http://localhost:5173)

# Building
npm run build            # TypeScript compilation + Vite build
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Run ESLint checks
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format code with Prettier

# Testing
npm test                 # Run tests in watch mode
npm run test:run         # Run tests once (CI mode)
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
```

### **Development Setup**

1. **Install Dependencies**: `npm install`
2. **Start Dev Server**: `npm run dev`
3. **Open Browser**: Navigate to `http://localhost:5173`
4. **Make Changes**: Files auto-reload with Vite HMR
5. **Run Tests**: `npm test` in another terminal

### **Pre-commit Checklist**

Before committing code, ensure:

- ✅ `npm run lint` passes with no errors
- ✅ `npm run test:run` passes all tests
- ✅ TypeScript compilation succeeds (`npm run build`)
- ✅ Code is formatted (`npm run format`)
- ✅ No console errors in browser dev tools

### **Adding New Features**

1. **Create Feature Branch**: `git checkout -b feature/module-name-feature`
2. **Create Feature Directory**: `src/features/[module]/`
3. **Define TypeScript Interfaces**: `src/types/[module].ts`
4. **Implement Components**: Follow established patterns
5. **Add Tests**: Create `.test.tsx` files alongside components
6. **Test Thoroughly**: Run tests and manual testing
7. **Update Documentation**: Update README.md if needed
8. **Submit PR**: Include description and screenshots

### **Code Review Checklist**

- ✅ TypeScript types are explicit and correct
- ✅ Components follow established patterns
- ✅ Responsive design works on all breakpoints
- ✅ Animations are smooth and performant
- ✅ Educational content is clear and accurate
- ✅ Accessibility standards are met

### **Testing Strategy**

The project uses **Vitest** for testing with comprehensive test coverage:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Generate coverage report
npm run test:coverage
```

**Testing Patterns:**

```typescript
// Component Testing (using @testing-library/react)
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});

// Hook Testing (using @testing-library/react)
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import useMyHook from './useMyHook';

describe('useMyHook', () => {
  it('should update state correctly', () => {
    const { result } = renderHook(() => useMyHook());
    act(() => {
      result.current.updateValue('new value');
    });
    expect(result.current.value).toBe('new value');
  });
});
```

**Test File Organization:**
- **Unit Tests**: Test utility functions and hooks
- **Component Tests**: Verify rendering and interactions
- **Integration Tests**: Test feature workflows
- Place test files next to the code they test: `Component.test.tsx`
- Use `src/test/` for shared test utilities and setup

**Existing Test Examples:**
- `src/shared/hooks/useDebounce.test.ts`
- `src/shared/hooks/useThrottle.test.ts`
- `src/shared/components/feedback/ErrorBoundary/ErrorBoundary.test.tsx`
- `src/shared/components/feedback/Toast/Toast.test.tsx`

## 🎯 Common Tasks and Patterns

### **Adding a New Learning Module**

Complete step-by-step guide:

1. **Create Feature Directory Structure**:
```bash
mkdir -p src/features/[module]/components/{sections,visualizations/2d}
touch src/features/[module]/index.tsx
```

2. **Add Type Definitions** (if needed):
```typescript
// src/types/[module].ts
export interface ModuleState {
  // Define your types
}
```

3. **Add Theme Colors**:
```typescript
// src/utils/theme.ts - Add to colors object
[module]: {
  primary: 'blue',
  secondary: 'indigo',
  accent: 'cyan',
  gradient: 'from-blue-50 via-white to-indigo-50',
  border: 'blue-100',
  shadow: 'blue-200',
}
```

4. **Create Main Page Component**:
```typescript
// src/features/[module]/index.tsx
import React from 'react';
import { SEO } from '../../shared/components/SEO';
import { ErrorBoundary } from '../../shared/components/feedback/ErrorBoundary';

const ModulePage: React.FC = () => {
  return (
    <ErrorBoundary level="page">
      <SEO title="Module Name - Code Executives" description="..." />
      {/* Your content */}
    </ErrorBoundary>
  );
};

export default ModulePage;
```

5. **Add Lazy Route in App.tsx**:
```typescript
// Import
const NewModulePage = lazy(() => import('./features/newmodule'));

// Route
<Route path="/newmodule" element={<SuspenseRoute><NewModulePage /></SuspenseRoute>} />
```

6. **Update Navigation**:
   - Add link in `src/components/Header.tsx`
   - Add link in `src/components/Sidebar.tsx`

7. **Create Visualizations**: Add to `src/features/[module]/components/visualizations/2d/`

8. **Write Tests**: Create `.test.tsx` files alongside components

9. **Update README.md**: Add module to the features list

### **Creating Interactive Visualizations**

1. **Start with SVG Structure**:
```typescript
const MyViz: React.FC = () => {
  return (
    <div className="relative w-full h-96">
      <svg viewBox="0 0 800 400" className="w-full h-full">
        {/* Static elements */}
      </svg>
    </div>
  );
};
```

2. **Add State Management**:
```typescript
const [step, setStep] = useState(0);
const [isPlaying, setIsPlaying] = useState(false);
```

3. **Implement Animation Logic**:
```typescript
useEffect(() => {
  if (!isPlaying) return;
  const interval = setInterval(() => {
    setStep(prev => (prev + 1) % totalSteps);
  }, 1000);
  return () => clearInterval(interval);
}, [isPlaying]);
```

4. **Add Demo Controls**:
```typescript
<div className="flex gap-2 mt-4">
  <button onClick={() => setIsPlaying(!isPlaying)}>
    {isPlaying ? 'Pause' : 'Play'}
  </button>
  <button onClick={() => setStep(0)}>Reset</button>
</div>
```

5. **Include Educational Tooltips**:
```typescript
<title>Explanation of what this element represents</title>
```

### **Using Shared Hooks**

The project includes several custom hooks in `src/shared/hooks/`:

```typescript
// Debounce user input
import { useDebounce } from '../../shared/hooks/useDebounce';
const debouncedValue = useDebounce(searchTerm, 300);

// Throttle frequent events
import { useThrottle } from '../../shared/hooks/useThrottle';
const throttledValue = useThrottle(scrollPosition, 100);

// Detect reduced motion preference
import { useReducedMotion } from '../../shared/hooks/useReducedMotion';
const prefersReducedMotion = useReducedMotion();

// Keyboard navigation
import { useKeyboardNavigation } from '../../shared/hooks/useKeyboardNavigation';
const { activeIndex, handleKeyDown } = useKeyboardNavigation(items.length);
```

### **Styling Best Practices**

```typescript
// Use Tailwind classes with consistent patterns
const buttonStyles = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200';
const primaryButton = `${buttonStyles} bg-blue-600 hover:bg-blue-700 text-white`;
const secondaryButton = `${buttonStyles} bg-gray-200 hover:bg-gray-300 text-gray-900`;

// Group related classes
const cardStyles = ['bg-white', 'border border-gray-200', 'rounded-xl shadow-sm', 'p-6'].join(' ');
```

**⚠️ Important**: Code Executives operates exclusively in light mode. Do not use `dark:` prefixed Tailwind classes as they have been completely removed from the application.

## 🐛 Debugging and Troubleshooting

### **Common Issues**

- **Animation Performance**: Use browser dev tools to identify heavy operations
- **TypeScript Errors**: Check interface definitions and prop passing
- **Responsive Issues**: Test with browser dev tools device simulation
- **Build Errors**: Ensure all imports are correct and files exist
- **Lazy Loading Errors**: Check that default exports are used in lazy-loaded components
- **Theme Issues**: Verify color scheme exists in `src/utils/theme.ts`

### **Development Tools**

- **Vite Dev Server**: Hot reload for rapid development (http://localhost:5173)
- **React Developer Tools**: Component debugging and profiler
- **TypeScript Compiler**: Type checking and error reporting
- **Browser Dev Tools**: Performance profiling and debugging
- **Performance Dashboard**: Built-in dashboard in dev mode (bottom-right corner)
- **Vitest UI**: Interactive test runner (`npm run test:ui`)

### **Debugging Strategies**

1. **Component Issues**:
   - Add `console.log` or use React DevTools
   - Check prop types and interfaces
   - Verify component is wrapped in ErrorBoundary

2. **Performance Issues**:
   - Open Performance Dashboard in dev mode
   - Use React DevTools Profiler
   - Check for unnecessary re-renders
   - Verify proper memoization

3. **Build Issues**:
   - Check TypeScript errors: `npm run build`
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for circular dependencies

4. **Test Failures**:
   - Run single test file: `npm test -- Component.test.tsx`
   - Use `test.only()` to isolate failing test
   - Check for missing test setup or mocks

## ⚠️ Common Pitfalls to Avoid

### **Don'ts**

- ❌ Don't use `dark:` prefixed Tailwind classes (light mode only)
- ❌ Don't create components in wrong directory (use features-based structure)
- ❌ Don't skip TypeScript types (explicit typing required)
- ❌ Don't ignore ESLint warnings (fix or justify them)
- ❌ Don't use inline styles (use Tailwind utilities)
- ❌ Don't forget to lazy load feature pages
- ❌ Don't skip ErrorBoundary wrappers
- ❌ Don't forget to update navigation when adding modules
- ❌ Don't commit without running tests
- ❌ Don't use any type (be explicit)

### **Do's**

- ✅ Use feature-based directory structure
- ✅ Wrap pages in ErrorBoundary and SEO components
- ✅ Use shared components and hooks when available
- ✅ Follow established patterns for consistency
- ✅ Write tests for new components and hooks
- ✅ Use semantic HTML and ARIA labels
- ✅ Optimize for accessibility and performance
- ✅ Add proper TypeScript types and interfaces
- ✅ Use lazy loading for heavy components
- ✅ Test responsive design on multiple breakpoints

## 📖 Resources and References

### **Key Documentation**

- [React Documentation](https://react.dev/) - React 19 features and hooks
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Type system reference
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Utility classes and configuration
- [Three.js Documentation](https://threejs.org/docs/) - 3D visualization library
- [Vite Documentation](https://vitejs.dev/) - Build tool and dev server
- [Vitest Documentation](https://vitest.dev/) - Testing framework
- [React Router Documentation](https://reactrouter.com/) - Routing library
- [React Testing Library](https://testing-library.com/react) - Component testing

### **Project-Specific Documentation**

- **README.md**: Comprehensive project overview and setup
- **docs/** directory: Implementation plans and guides for each module
  - `Next.js-Implementation-Plan.md`
  - `Data-Structures-Implementation-Plan.md`
  - `Big-O-Notation-Implementation-Plan.md`
  - `Python-Module-Implementation-Plan.md`
  - And more...

### **Educational Content Guidelines**

- Keep explanations clear and beginner-friendly
- Use progressive disclosure (simple to complex)
- Include real-world examples and use cases
- Provide multiple learning paths for different skill levels
- Add interactive visualizations for complex concepts
- Include step-by-step animations for algorithms
- Use consistent metaphors across related concepts
- Provide practice problems and solutions

### **Component Libraries**

- **Lucide React**: https://lucide.dev/ - Icon library
- **React Helmet**: https://github.com/dr-pogodin/react-helmet - SEO and meta tags

### **Best Practices Resources**

- [React Best Practices 2024](https://react.dev/learn)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Accessibility Guidelines (WCAG 2.1)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Performance Best Practices](https://web.dev/performance/)

---

## 📋 Summary

**Remember**: This project is educational first - prioritize clarity, interactivity, and visual appeal over complex features. Every component should contribute to the learning experience.

### **Key Principles**

1. **Feature-Based Architecture**: Self-contained modules in `src/features/`
2. **Shared Infrastructure**: Reusable components, hooks, and services in `src/shared/`
3. **TypeScript Strict Mode**: Explicit types required for all code
4. **Accessibility First**: WCAG 2.1 AA compliance with semantic HTML
5. **Performance Optimized**: Lazy loading, memoization, code splitting
6. **Test Coverage**: Comprehensive tests with Vitest
7. **Light Mode Only**: No dark theme support
8. **Educational Focus**: Clear explanations with interactive visualizations

### **When Adding New Code**

1. Follow features-based directory structure
2. Use TypeScript with explicit types
3. Add tests alongside components
4. Use shared components and hooks
5. Ensure accessibility compliance
6. Optimize for performance
7. Run linting and tests before committing
8. Update documentation as needed

### **Quick Commands**

```bash
npm run dev          # Start development
npm run build        # Build for production
npm test             # Run tests
npm run lint         # Check code quality
npm run format       # Format code
```
