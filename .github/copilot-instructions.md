# GitHub Copilot Instructions for Code Executives

## 🎯 Project Overview

**Code Executives** is an interactive programming education platform that transforms complex technical concepts into engaging visual learning experiences. The application uses React, TypeScript, and modern web technologies to create immersive educational content through 2D/3D visualizations.

## 🏗️ Architecture Principles

### **Core Technologies**

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4.x with utility-first approach
- **Routing**: React Router for SPA navigation
- **Visualizations**: SVG for 2D models, Three.js for 3D scenes
- **Icons**: Lucide React for consistent iconography

### **Project Structure Philosophy**

```
src/
├── components/           # Reusable UI components
│   ├── models2d/        # 2D educational visualizations
│   ├── models3d/        # 3D interactive models
│   └── shared/          # Cross-module shared components
├── pages/               # Top-level page components
├── sections/            # Educational content modules
├── hooks/               # Custom React hooks for state management
├── types/               # TypeScript definitions
├── utils/               # Pure utility functions
└── three/               # Three.js models and scenes
```

## 🎨 Design System Guidelines

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

### **Educational Content Structure**

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

### **2D Visualization Components (src/components/models2d/)**

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

### **Educational Section Components (src/sections/)**

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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Section Title
          </h2>
          <div className="prose dark:prose-invert">
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

## 📚 Module-Specific Guidelines

### **Git Tutorial Module**

- Focus on visual representation of Git operations
- Use consistent color coding: green for staged, blue for committed, red for conflicts
- Animate file state transitions clearly
- Include realistic file/folder structures in examples

### **JavaScript Engine Module**

- Emphasize execution flow with call stack visualizations
- Show memory allocation patterns clearly
- Use consistent metaphors (restaurant kitchen for event loop, library for memory heap)
- Include performance implications in explanations

### **RxJS Module**

- Use marble diagrams extensively
- Show data flow through operators visually
- Include interactive stream builders
- Demonstrate error handling patterns

## 🚨 Code Quality Standards

### **TypeScript Requirements**

- All functions must have explicit return types
- Use strict type checking (`strict: true` in tsconfig)
- Prefer interfaces over types for object shapes
- Use generic types for reusable components

### **Performance Guidelines**

- Lazy load heavy components with `React.lazy()`
- Optimize SVG animations with `will-change` CSS property
- Use `useMemo` and `useCallback` for expensive computations
- Minimize re-renders with proper dependency arrays

### **Accessibility Standards**

- All interactive elements must be keyboard accessible
- Use semantic HTML elements
- Include ARIA labels for complex visualizations
- Ensure color contrast meets WCAG 2.1 AA standards

## 🛠️ Development Workflow

### **Adding New Features**

1. **Create Feature Branch**: `feature/module-name-feature`
2. **Component Structure**: Follow existing patterns in corresponding directories
3. **TypeScript Interfaces**: Define all props and state interfaces
4. **Responsive Design**: Test on mobile, tablet, and desktop
5. **Animation Testing**: Ensure smooth performance across devices

### **Code Review Checklist**

- ✅ TypeScript types are explicit and correct
- ✅ Components follow established patterns
- ✅ Responsive design works on all breakpoints
- ✅ Animations are smooth and performant
- ✅ Educational content is clear and accurate
- ✅ Accessibility standards are met

### **Testing Strategy**

- **Unit Tests**: Test utility functions and hooks
- **Component Tests**: Verify rendering and interactions
- **Visual Tests**: Ensure animations work correctly
- **Cross-browser**: Test in Chrome, Firefox, Safari, Edge

## 🎯 Common Tasks and Patterns

### **Adding a New Learning Module**

1. Create section components in `src/sections/[module]/`
2. Add 2D visualizations in `src/components/models2d/[module]/`
3. Create page component in `src/pages/[Module]Page.tsx`
4. Update navigation in `Header.tsx` and `Sidebar.tsx`
5. Add routing in `App.tsx`

### **Creating Interactive Visualizations**

1. Start with SVG structure and static layout
2. Add state management for animation steps
3. Implement click handlers for interactivity
4. Add demo controls (play, pause, reset)
5. Include educational tooltips and explanations

### **Styling Best Practices**

```typescript
// Use Tailwind classes with consistent patterns
const buttonStyles = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200';
const primaryButton = `${buttonStyles} bg-blue-600 hover:bg-blue-700 text-white`;
const secondaryButton = `${buttonStyles} bg-gray-200 hover:bg-gray-300 text-gray-900`;

// Group related classes
const cardStyles = [
  'bg-white dark:bg-gray-800',
  'border border-gray-200 dark:border-gray-700',
  'rounded-xl shadow-sm',
  'p-6',
].join(' ');
```

## 🐛 Debugging and Troubleshooting

### **Common Issues**

- **Animation Performance**: Use browser dev tools to identify heavy operations
- **TypeScript Errors**: Check interface definitions and prop passing
- **Responsive Issues**: Test with browser dev tools device simulation
- **Build Errors**: Ensure all imports are correct and files exist

### **Development Tools**

- **Vite Dev Server**: Hot reload for rapid development
- **React Developer Tools**: Component debugging
- **TypeScript Compiler**: Type checking and error reporting
- **Browser Dev Tools**: Performance profiling and debugging

## 📖 Resources and References

### **Key Documentation**

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Three.js Documentation](https://threejs.org/docs/)
- [Vite Documentation](https://vitejs.dev/)

### **Educational Content Guidelines**

- Keep explanations clear and beginner-friendly
- Use progressive disclosure (simple to complex)
- Include real-world examples and use cases
- Provide multiple learning paths for different skill levels

---

**Remember**: This project is educational first - prioritize clarity, interactivity, and visual appeal over complex features. Every component should contribute to the learning experience.
