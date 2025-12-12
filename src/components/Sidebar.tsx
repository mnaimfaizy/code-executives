import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { getSectionTheme } from '../utils/theme';
import { useUI } from '../shared/contexts';

// Helper function to get theme color classes
const getThemeColorClass = (
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
    border: string;
    shadow: string;
  },
  type: 'active' | 'hover' | 'buttonActive' | 'buttonHover' | 'border'
) => {
  const colorMap: Record<string, Record<string, string>> = {
    purple: {
      active: 'bg-purple-100 text-purple-800 border-purple-500',
      hover: 'hover:bg-purple-50 hover:text-purple-700',
      buttonActive: 'text-purple-600 hover:text-purple-700',
      buttonHover: 'hover:text-purple-600',
      border: 'border-purple-100',
    },
    orange: {
      active: 'bg-orange-100 text-orange-800 border-orange-500',
      hover: 'hover:bg-orange-50 hover:text-orange-700',
      buttonActive: 'text-orange-600 hover:text-orange-700',
      buttonHover: 'hover:text-orange-600',
      border: 'border-orange-200',
    },
    indigo: {
      active: 'bg-indigo-100 text-indigo-800 border-indigo-500',
      hover: 'hover:bg-indigo-50 hover:text-indigo-700',
      buttonActive: 'text-indigo-600 hover:text-indigo-700',
      buttonHover: 'hover:text-indigo-600',
      border: 'border-indigo-100',
    },
    blue: {
      active: 'bg-blue-100 text-blue-800 border-blue-500',
      hover: 'hover:bg-blue-50 hover:text-blue-700',
      buttonActive: 'text-blue-600 hover:text-blue-700',
      buttonHover: 'hover:text-blue-600',
      border: 'border-blue-100',
    },
    emerald: {
      active: 'bg-emerald-100 text-emerald-800 border-emerald-500',
      hover: 'hover:bg-emerald-50 hover:text-emerald-700',
      buttonActive: 'text-emerald-600 hover:text-emerald-700',
      buttonHover: 'hover:text-emerald-600',
      border: 'border-emerald-100',
    },
  };

  const colors = colorMap[theme.primary] || colorMap.blue;
  return colors[type];
};

interface SidebarItem {
  label: string;
  path: string;
  subItems?: SidebarItem[];
}

const sidebarSections: Record<string, Array<SidebarItem>> = {
  '/javascript': [
    { label: 'Introduction', path: '/javascript?section=Introduction' },
    { label: 'JavaScript History', path: '/javascript?section=JavaScript%20History' },
    {
      label: 'Engine & Runtime Comparison',
      path: '/javascript?section=Engine%20%26%20Runtime%20Comparison',
    },
    {
      label: 'JavaScript Engine',
      path: '/javascript?section=JavaScript%20Engine',
      subItems: [
        {
          label: 'Call Stack & Execution',
          path: '/javascript?section=Call%20Stack%20%26%20Execution',
        },
        {
          label: 'Memory Heap & Objects',
          path: '/javascript?section=Memory%20Heap%20%26%20Objects',
        },
        {
          label: 'Parser & AST Generation',
          path: '/javascript?section=Parser%20%26%20AST%20Generation',
        },
        {
          label: 'JIT Compilation Pipeline',
          path: '/javascript?section=JIT%20Compilation%20Pipeline',
        },
        { label: 'Garbage Collection', path: '/javascript?section=Garbage%20Collection' },
      ],
    },
    {
      label: 'JavaScript Runtime',
      path: '/javascript?section=JavaScript%20Runtime',
      subItems: [
        {
          label: 'Event Loop & Coordination',
          path: '/javascript?section=Event%20Loop%20%26%20Coordination',
        },
        {
          label: 'Web APIs & Platform',
          path: '/javascript?section=Web%20APIs%20%26%20Platform',
        },
        {
          label: 'Task Queues & Priority',
          path: '/javascript?section=Task%20Queues%20%26%20Priority',
        },
        {
          label: 'V8 Runtime Features',
          path: '/javascript?section=V8%20Runtime%20Features',
        },
      ],
    },
    {
      label: 'Memory Management',
      path: '/javascript?section=Memory%20Management',
      subItems: [{ label: 'Memory Leaks', path: '/javascript?section=Memory%20Leaks' }],
    },
    { label: 'Visualization', path: '/javascript?section=Visualization' },
  ],
  '/rxjs': [
    { label: 'Introduction', path: '/rxjs?section=Introduction' },
    { label: 'Reactive Manifesto', path: '/rxjs?section=Reactive%20Manifesto' },
    {
      label: 'Core Components',
      path: '/rxjs?section=Core%20Components',
      subItems: [
        { label: 'Observables', path: '/rxjs?section=Observables' },
        { label: 'Operators', path: '/rxjs?section=Operators' },
        { label: 'Subjects', path: '/rxjs?section=Subjects' },
      ],
    },
    {
      label: 'Advanced Concepts',
      path: '/rxjs?section=Advanced%20Concepts',
      subItems: [
        { label: 'Advanced Operators', path: '/rxjs?section=Advanced%20Operators' },
        { label: 'Marble Diagrams', path: '/rxjs?section=Marble%20Diagrams' },
        { label: 'Error Handling', path: '/rxjs?section=Error%20Handling' },
      ],
    },
    {
      label: 'Real-World Applications',
      path: '/rxjs?section=Real-World%20Applications',
      subItems: [
        { label: 'Real-World Examples', path: '/rxjs?section=Real-World%20Examples' },
        { label: 'Visualization Tool', path: '/rxjs?section=Visualization%20Tool' },
      ],
    },
  ],
  '/git': [
    { label: 'Introduction', path: '/git?section=Introduction' },
    { label: 'Git Architecture', path: '/git?section=Git%20Architecture' },
    { label: 'Three-Tree Model', path: '/git?section=Three-Tree%20Model' },
    { label: 'Object Model', path: '/git?section=Object%20Model' },
    { label: 'Core Workflow', path: '/git?section=Core%20Workflow' },
    { label: 'Branching & Merging', path: '/git?section=Branching%20%26%20Merging' },
    { label: 'Professional Workflows', path: '/git?section=Professional%20Workflows' },
    { label: 'History Management', path: '/git?section=History%20Management' },
    { label: 'Troubleshooting', path: '/git?section=Troubleshooting' },
    { label: 'Visualization', path: '/git?section=Visualization' },
  ],
  '/datastructures': [
    { label: 'Introduction', path: '/datastructures?section=Introduction' },
    {
      label: 'Linear Structures',
      path: '/datastructures?section=Linear%20Structures',
      subItems: [
        { label: 'Arrays', path: '/datastructures?section=Arrays' },
        { label: 'Linked Lists', path: '/datastructures?section=Linked%20Lists' },
        { label: 'Stacks', path: '/datastructures?section=Stacks' },
        { label: 'Queues', path: '/datastructures?section=Queues' },
        { label: 'Deques', path: '/datastructures?section=Deques' },
        { label: 'Strings', path: '/datastructures?section=Strings' },
      ],
    },
    { label: 'Hash Tables', path: '/datastructures?section=Hash%20Tables' },
    { label: 'Sets', path: '/datastructures?section=Sets' },
    {
      label: 'Tree Structures',
      path: '/datastructures?section=Tree%20Structures',
      subItems: [
        { label: 'Binary Trees', path: '/datastructures?section=Binary%20Trees' },
        { label: 'Binary Search Trees', path: '/datastructures?section=Binary%20Search%20Trees' },
        { label: 'AVL Trees', path: '/datastructures?section=AVL%20Trees' },
        { label: 'Red-Black Trees', path: '/datastructures?section=Red-Black%20Trees' },
        { label: 'Heaps', path: '/datastructures?section=Heaps' },
        { label: 'B-Trees', path: '/datastructures?section=B-Trees' },
      ],
    },
    {
      label: 'Graph Structures',
      path: '/datastructures?section=Graph%20Structures',
      subItems: [
        { label: 'Graph Overview', path: '/datastructures?section=graphs' },
        { label: 'Graph Representation', path: '/datastructures?section=graph-representation' },
        { label: 'Graph Traversal', path: '/datastructures?section=graph-traversal' },
        { label: 'Shortest Path', path: '/datastructures?section=shortest-path' },
        { label: 'Minimum Spanning Tree', path: '/datastructures?section=minimum-spanning-tree' },
        { label: 'Graph Types', path: '/datastructures?section=graph-types' },
      ],
    },
    { label: 'Complexity Analysis', path: '/datastructures?section=Complexity%20Analysis' },
    { label: 'Interactive Playground', path: '/datastructures?section=playground' },
    { label: 'Real-World Applications', path: '/datastructures?section=Real-World%20Applications' },
    { label: 'Practice Problems', path: '/datastructures?section=Practice%20Problems' },
    { label: '3D Visualizations', path: '/datastructures?section=3D%20Visualizations' },
  ],
  '/react': [
    { label: 'Introduction', path: '/react?section=Introduction' },
    { label: 'JSX', path: '/react?section=JSX' },
    { label: 'Components', path: '/react?section=Components' },
    { label: 'State & Props', path: '/react?section=State%20%26%20Props' },
    { label: 'Hooks', path: '/react?section=Hooks' },
    { label: 'DOM Fundamentals', path: '/react?section=DOM%20Fundamentals' },
    { label: 'Virtual DOM', path: '/react?section=Virtual%20DOM' },
    { label: 'Reconciliation', path: '/react?section=Reconciliation' },
  ],
  '/nextjs': [
    { label: 'Introduction', path: '/nextjs?section=Introduction' },
    { label: 'Routing Systems', path: '/nextjs?section=Routing%20Systems' },
    { label: 'Rendering Strategies', path: '/nextjs?section=Rendering%20Strategies' },
    {
      label: 'Server & Client Components',
      path: '/nextjs?section=Server%20%26%20Client%20Components',
    },
    {
      label: 'Data Fetching & Mutations',
      path: '/nextjs?section=Data%20Fetching%20%26%20Mutations',
    },
    {
      label: 'Middleware & Route Handlers',
      path: '/nextjs?section=Middleware%20%26%20Route%20Handlers',
    },
    {
      label: 'Optimization & Performance',
      path: '/nextjs?section=Optimization%20%26%20Performance',
    },
  ],
  '/bigo': [
    { label: 'Introduction', path: '/bigo?section=introduction' },
    { label: 'Core Concepts', path: '/bigo?section=core-concepts' },
    { label: 'Common Complexities', path: '/bigo?section=common-complexities' },
    { label: 'Algorithm Analysis', path: '/bigo?section=algorithm-analysis' },
    { label: 'Advanced Concepts', path: '/bigo?section=advanced-concepts' },
    { label: 'Practice Challenges', path: '/bigo?section=practice-challenges' },
    { label: 'Interactive Playground', path: '/bigo?section=playground' },
    { label: 'Gamification Hub', path: '/bigo?section=gamification-hub' },
    { label: 'Real-World Applications', path: '/bigo?section=real-world-applications' },
  ],
  '/python': [
    { label: 'Introduction', path: '/python?section=Introduction' },
    { label: 'Python Philosophy', path: '/python?section=Python%20Philosophy' },
    { label: 'Execution Model', path: '/python?section=Execution%20Model' },
    { label: 'Memory Management', path: '/python?section=Memory%20Management' },
    { label: 'Global Interpreter Lock', path: '/python?section=Global%20Interpreter%20Lock' },
    { label: 'Advanced Concepts', path: '/python?section=Advanced%20Concepts' },
  ],
  '/systemdesign': [
    { label: 'Introduction', path: '/systemdesign?section=Introduction' },
    { label: 'Architecture Patterns', path: '/systemdesign?section=Architecture%20Patterns' },
    { label: 'Distributed Systems', path: '/systemdesign?section=Distributed%20Systems' },
    { label: 'Scaling Strategies', path: '/systemdesign?section=Scaling%20Strategies' },
    { label: 'Design Principles', path: '/systemdesign?section=Design%20Principles' },
    { label: 'Case Studies', path: '/systemdesign?section=Case%20Studies' },
    { label: 'Visualization', path: '/systemdesign?section=Visualization' },
  ],
  '/typescript': [
    { label: 'Introduction', path: '/typescript?section=Introduction' },
    { label: 'TypeScript vs JavaScript', path: '/typescript?section=TypeScript%20vs%20JavaScript' },
    {
      label: 'OOP Fundamentals',
      path: '/typescript?section=OOP%20Fundamentals',
      subItems: [
        { label: 'Classes & Objects', path: '/typescript?section=Classes%20%26%20Objects' },
        { label: 'Inheritance', path: '/typescript?section=Inheritance' },
        { label: 'Polymorphism', path: '/typescript?section=Polymorphism' },
        { label: 'Encapsulation', path: '/typescript?section=Encapsulation' },
        { label: 'Abstraction', path: '/typescript?section=Abstraction' },
      ],
    },
    {
      label: 'Advanced TypeScript',
      path: '/typescript?section=Advanced%20TypeScript',
      subItems: [
        { label: 'Generics', path: '/typescript?section=Generics' },
        { label: 'Decorators', path: '/typescript?section=Decorators' },
        { label: 'Advanced Types', path: '/typescript?section=Advanced%20Types' },
        { label: 'Type Guards', path: '/typescript?section=Type%20Guards' },
      ],
    },
    { label: 'TypeScript Visualization', path: '/typescript?section=TypeScript%20Visualization' },
    { label: 'Best Practices', path: '/typescript?section=Best%20Practices' },
    { label: 'Migration Guide', path: '/typescript?section=Migration%20Guide' },
  ],
  '/': [],
  '/about': [],
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { sidebarOpen, closeSidebar } = useUI();
  const sidebarRef = useRef<HTMLElement>(null);
  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);

  // Determine section from pathname
  const getSectionFromPath = (
    path: string
  ):
    | 'javascript'
    | 'git'
    | 'datastructures'
    | 'rxjs'
    | 'react'
    | 'nextjs'
    | 'bigo'
    | 'python'
    | 'systemdesign'
    | 'typescript' => {
    if (path.includes('javascript')) return 'javascript';
    if (path.includes('python')) return 'python';
    if (path.includes('react')) return 'react';
    if (path.includes('nextjs')) return 'nextjs';
    if (path.includes('git')) return 'git';
    if (path.includes('datastructures')) return 'datastructures';
    if (path.includes('rxjs')) return 'rxjs';
    if (path.includes('bigo')) return 'bigo';
    if (path.includes('systemdesign')) return 'systemdesign';
    if (path.includes('typescript')) return 'typescript';
    return 'javascript'; // default
  };

  const section = getSectionFromPath(location.pathname);
  const theme = getSectionTheme(section);

  // Initialize expanded items based on current section
  const getInitialExpandedItems = () => {
    const query = new URLSearchParams(location.search);
    const currentSection = query.get('section') || 'Introduction';
    const basePath = location.pathname;
    const sections = sidebarSections[basePath] || [];

    const expanded: string[] = [];
    sections.forEach((item) => {
      if (item.subItems) {
        const shouldExpand =
          currentSection === item.label ||
          item.subItems.some((sub) => sub.label === currentSection);
        if (shouldExpand) {
          expanded.push(item.label);
        }
      }
    });
    return expanded;
  };

  const [expandedItems, setExpandedItems] = useState<string[]>(getInitialExpandedItems);

  // Get the base path (e.g., '/javascript')
  const basePath = location.pathname;
  const sections = sidebarSections[basePath] || [];

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isExpanded = (label: string) => expandedItems.includes(label);

  // Swipe gesture handling for mobile
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (sidebarOpen && sidebarRef.current) {
        touchStartX.current = e.touches[0].clientX;
        touchCurrentX.current = e.touches[0].clientX;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (sidebarOpen && sidebarRef.current) {
        touchCurrentX.current = e.touches[0].clientX;
        const diff = touchCurrentX.current - touchStartX.current;

        // Only allow left swipe (closing gesture)
        if (diff < 0) {
          const translateX = Math.max(diff, -256); // Limit to sidebar width (w-64 = 256px)
          sidebarRef.current.style.transform = `translateX(${translateX}px)`;
        }
      }
    };

    const handleTouchEnd = () => {
      if (sidebarOpen && sidebarRef.current) {
        const diff = touchCurrentX.current - touchStartX.current;

        // If swiped more than 50px to the left, close the sidebar
        if (diff < -50) {
          closeSidebar();
        }

        // Reset transform
        sidebarRef.current.style.transform = '';
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [sidebarOpen, closeSidebar]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        closeSidebar();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen, closeSidebar]);

  const renderMenuItem = (item: SidebarItem, isSubItem = false) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const expanded = isExpanded(item.label);

    // Check if this item is active based on current section query param
    const query = new URLSearchParams(location.search);
    const currentSection = query.get('section') || 'Introduction'; // Default to Introduction
    const isActive =
      currentSection === item.label || item.subItems?.some((sub) => sub.label === currentSection);

    return (
      <li key={item.label} className="relative">
        <div className="flex items-center group">
          <Link
            to={item.path}
            onClick={() => {
              closeSidebar();
              // Auto-expand parent when clicking on it
              if (hasSubItems && !expanded) {
                toggleExpanded(item.label);
              }
            }}
            className={`flex-1 block rounded-lg px-3 py-2.5 text-sm transition-all duration-200 border-l-4 ${
              isActive
                ? `${getThemeColorClass(theme, 'active')} font-semibold shadow-sm`
                : `text-gray-700 border-transparent ${getThemeColorClass(
                    theme,
                    'hover'
                  )} hover:pl-4 hover:border-l-2 hover:border-gray-300`
            } ${isSubItem ? 'ml-4 text-xs py-2' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="flex items-center justify-between">
              {item.label}
              {hasSubItems && !isSubItem && (
                <span className="text-gray-400 text-xs ml-2">{item.subItems?.length}</span>
              )}
            </span>
          </Link>
          {hasSubItems && !isSubItem && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(item.label);
              }}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? getThemeColorClass(theme, 'buttonActive')
                  : `text-gray-400 ${getThemeColorClass(theme, 'buttonHover')}`
              }`}
              aria-label={`${expanded ? 'Collapse' : 'Expand'} ${item.label}`}
              aria-expanded={expanded}
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        {hasSubItems && expanded && (
          <ul className="mt-1 space-y-0.5 ml-2 animate-in slide-in-from-top-2 duration-200">
            {item.subItems?.map((subItem) => renderMenuItem(subItem, true))}
          </ul>
        )}
      </li>
    );
  };

  // Don't render sidebar if there are no sections
  if (sections.length === 0) {
    return null;
  }

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-200"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        aria-hidden={!sidebarOpen}
        aria-label="Sidebar navigation"
        className={[
          // Base styles
          'fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg transition-transform duration-300 ease-out border-r overflow-y-auto',
          // Mobile behavior
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop behavior - sticky and always visible
          'lg:translate-x-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:z-30 lg:shadow-sm',
          // Dynamic border color
          getThemeColorClass(theme, 'border'),
          // Smooth scrolling
          'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400',
        ].join(' ')}
      >
        <nav className="p-4" role="navigation">
          {/* Section title */}
          <div className="mb-4 pb-3 border-b border-gray-200">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
              On This Page
            </h2>
          </div>

          {/* Navigation items */}
          <ul className="space-y-1">{sections.map((item) => renderMenuItem(item))}</ul>

          {/* Footer hint for mobile gestures */}
          <div className="mt-8 px-3 py-4 border-t border-gray-200 lg:hidden">
            <p className="text-xs text-gray-500 text-center">💡 Swipe left to close sidebar</p>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
