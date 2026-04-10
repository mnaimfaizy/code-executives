export interface SidebarItem {
  label: string;
  path: string;
  subItems?: SidebarItem[];
}

export type LearningModuleId =
  | 'javascript'
  | 'rxjs'
  | 'git'
  | 'datastructures'
  | 'react'
  | 'nextjs'
  | 'bigo'
  | 'python'
  | 'systemdesign'
  | 'typescript'
  | 'ai'
  | 'nodejs'
  | 'devops'
  | 'auth'
  | 'backend'
  | 'database';

export interface LearningModuleConfig {
  id: LearningModuleId;
  title: string;
  path: `/${LearningModuleId}`;
  bankFile: `${LearningModuleId}.quiz.json`;
  theme: LearningModuleId;
}

export const learningModuleConfigs: Record<LearningModuleId, LearningModuleConfig> = {
  javascript: {
    id: 'javascript',
    title: 'JavaScript',
    path: '/javascript',
    bankFile: 'javascript.quiz.json',
    theme: 'javascript',
  },
  rxjs: {
    id: 'rxjs',
    title: 'RxJS',
    path: '/rxjs',
    bankFile: 'rxjs.quiz.json',
    theme: 'rxjs',
  },
  git: {
    id: 'git',
    title: 'Git',
    path: '/git',
    bankFile: 'git.quiz.json',
    theme: 'git',
  },
  datastructures: {
    id: 'datastructures',
    title: 'Data Structures',
    path: '/datastructures',
    bankFile: 'datastructures.quiz.json',
    theme: 'datastructures',
  },
  react: {
    id: 'react',
    title: 'React',
    path: '/react',
    bankFile: 'react.quiz.json',
    theme: 'react',
  },
  nextjs: {
    id: 'nextjs',
    title: 'Next.js',
    path: '/nextjs',
    bankFile: 'nextjs.quiz.json',
    theme: 'nextjs',
  },
  bigo: {
    id: 'bigo',
    title: 'Big-O Notation',
    path: '/bigo',
    bankFile: 'bigo.quiz.json',
    theme: 'bigo',
  },
  python: {
    id: 'python',
    title: 'Python',
    path: '/python',
    bankFile: 'python.quiz.json',
    theme: 'python',
  },
  systemdesign: {
    id: 'systemdesign',
    title: 'System Design',
    path: '/systemdesign',
    bankFile: 'systemdesign.quiz.json',
    theme: 'systemdesign',
  },
  typescript: {
    id: 'typescript',
    title: 'TypeScript',
    path: '/typescript',
    bankFile: 'typescript.quiz.json',
    theme: 'typescript',
  },
  ai: {
    id: 'ai',
    title: 'AI Fundamentals',
    path: '/ai',
    bankFile: 'ai.quiz.json',
    theme: 'ai',
  },
  nodejs: {
    id: 'nodejs',
    title: 'Node.js',
    path: '/nodejs',
    bankFile: 'nodejs.quiz.json',
    theme: 'nodejs',
  },
  devops: {
    id: 'devops',
    title: 'DevOps',
    path: '/devops',
    bankFile: 'devops.quiz.json',
    theme: 'devops',
  },
  auth: {
    id: 'auth',
    title: 'Authentication & Authorization',
    path: '/auth',
    bankFile: 'auth.quiz.json',
    theme: 'auth',
  },
  backend: {
    id: 'backend',
    title: 'Backend Architecture',
    path: '/backend',
    bankFile: 'backend.quiz.json',
    theme: 'backend',
  },
  database: {
    id: 'database',
    title: 'Database & DBMS',
    path: '/database',
    bankFile: 'database.quiz.json',
    theme: 'database',
  },
};

const baseModuleNavigationSections: Record<string, SidebarItem[]> = {
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
  '/ai': [
    { label: 'Introduction', path: '/ai?section=Introduction' },
    { label: 'ML Lifecycle', path: '/ai?section=ML%20Lifecycle' },
    { label: 'Feature Engineering', path: '/ai?section=Feature%20Engineering' },
    { label: 'Neural Networks', path: '/ai?section=Neural%20Networks' },
    { label: 'Loss Functions', path: '/ai?section=Loss%20Functions' },
    { label: 'Gradient Descent', path: '/ai?section=Gradient%20Descent' },
    { label: 'Backpropagation', path: '/ai?section=Backpropagation' },
    { label: 'Generalization', path: '/ai?section=Generalization' },
    { label: 'Training vs Inference', path: '/ai?section=Training%20vs%20Inference' },
    { label: 'Word Embeddings', path: '/ai?section=Word%20Embeddings' },
    { label: 'RAG Pipeline', path: '/ai?section=RAG%20Pipeline' },
  ],
  '/nodejs': [
    { label: 'Introduction', path: '/nodejs?section=Introduction' },
    { label: 'Event Loop', path: '/nodejs?section=Event%20Loop' },
    { label: 'Async Programming', path: '/nodejs?section=Async%20Programming' },
    { label: 'Buffers & Streams', path: '/nodejs?section=Buffers%20%26%20Streams' },
    { label: 'Scaling', path: '/nodejs?section=Scaling' },
    { label: 'Memory Management', path: '/nodejs?section=Memory%20Management' },
    { label: 'Module System', path: '/nodejs?section=Module%20System' },
    { label: 'Package Managers', path: '/nodejs?section=Package%20Managers' },
    { label: 'Frameworks', path: '/nodejs?section=Frameworks' },
    { label: 'Runtime Wars', path: '/nodejs?section=Runtime%20Wars' },
  ],
  '/devops': [
    { label: 'Introduction', path: '/devops?section=Introduction' },
    { label: 'CI/CD Pipeline', path: '/devops?section=CI%2FCD%20Pipeline' },
    { label: 'Cloud Service Models', path: '/devops?section=Cloud%20Service%20Models' },
    { label: 'Cloud Architecture', path: '/devops?section=Cloud%20Architecture' },
    { label: 'Container Orchestration', path: '/devops?section=Container%20Orchestration' },
    { label: 'Infrastructure as Code', path: '/devops?section=Infrastructure%20as%20Code' },
    { label: 'Modern Dev Roles', path: '/devops?section=Modern%20Dev%20Roles' },
    { label: 'Observability', path: '/devops?section=Observability' },
  ],
  '/auth': [
    { label: 'Introduction', path: '/auth?section=Introduction' },
    {
      label: 'Evolution of Digital Identity',
      path: '/auth?section=Evolution%20of%20Digital%20Identity',
    },
    { label: 'Authentication Types', path: '/auth?section=Authentication%20Types' },
    { label: 'Authorization Models', path: '/auth?section=Authorization%20Models' },
    {
      label: 'OAuth 2.0 & OpenID Connect',
      path: '/auth?section=OAuth%202.0%20%26%20OpenID%20Connect',
    },
    { label: 'PKCE Authorization Flow', path: '/auth?section=PKCE%20Authorization%20Flow' },
    { label: 'BFF Pattern', path: '/auth?section=BFF%20Pattern' },
    { label: 'AI Agent Authentication', path: '/auth?section=AI%20Agent%20Authentication' },
    { label: 'Visualization', path: '/auth?section=Visualization' },
  ],
  '/backend': [
    { label: 'Introduction', path: '/backend?section=Introduction' },
    { label: 'Backend Evolution', path: '/backend?section=Backend%20Evolution' },
    { label: 'Architecture Patterns', path: '/backend?section=Architecture%20Patterns' },
    { label: 'Resilience Patterns', path: '/backend?section=Resilience%20Patterns' },
    { label: 'Database Theory', path: '/backend?section=Database%20Theory' },
    { label: 'API Design', path: '/backend?section=API%20Design' },
    { label: 'Real-Time Communication', path: '/backend?section=Real-Time%20Communication' },
    { label: 'Observability', path: '/backend?section=Observability' },
    { label: 'Request Lifecycle', path: '/backend?section=Request%20Lifecycle' },
    { label: 'Visualization', path: '/backend?section=Visualization' },
  ],
  '/database': [
    { label: 'Introduction', path: '/database?section=Introduction' },
    { label: 'Database Models', path: '/database?section=Database%20Models' },
    {
      label: 'DBMS Architecture',
      path: '/database?section=DBMS%20Architecture',
      subItems: [
        { label: 'Query Processor', path: '/database?section=Query%20Processor' },
        { label: 'Storage Engine', path: '/database?section=Storage%20Engine' },
      ],
    },
    { label: 'SQL Fundamentals', path: '/database?section=SQL%20Fundamentals' },
    {
      label: 'Indexing & Optimization',
      path: '/database?section=Indexing%20%26%20Optimization',
    },
    { label: 'Transactions & ACID', path: '/database?section=Transactions%20%26%20ACID' },
    { label: 'Oracle vs PostgreSQL', path: '/database?section=Oracle%20vs%20PostgreSQL' },
    {
      label: 'SQL vs NoSQL vs Vector',
      path: '/database?section=SQL%20vs%20NoSQL%20vs%20Vector',
    },
    { label: 'Visualization', path: '/database?section=Visualization' },
  ],
  '/': [],
  '/about': [],
};

export const getSectionQueryValue = (path: string): string | null => {
  const queryStart = path.indexOf('?');
  if (queryStart === -1) {
    return null;
  }

  const query = path.slice(queryStart + 1);
  return new URLSearchParams(query).get('section');
};

const createQuizSidebarItem = (path: string): SidebarItem => ({
  label: 'Quiz',
  path: `${path}?section=Quiz`,
});

export const moduleNavigationSections: Record<string, SidebarItem[]> = Object.fromEntries(
  Object.entries(baseModuleNavigationSections).map(([path, items]) => {
    if (path === '/' || path === '/about') {
      return [path, items];
    }

    return [path, [...items, createQuizSidebarItem(path)]];
  })
);

export const learningModuleIds = Object.keys(learningModuleConfigs) as LearningModuleId[];

export const getModuleIdFromPathname = (pathname: string): LearningModuleId | null => {
  const match = learningModuleIds.find(
    (moduleId) => learningModuleConfigs[moduleId].path === pathname
  );
  return match ?? null;
};

export const getModuleConfigFromPathname = (pathname: string): LearningModuleConfig | null => {
  const moduleId = getModuleIdFromPathname(pathname);
  return moduleId ? learningModuleConfigs[moduleId] : null;
};

const flattenSidebarItems = (items: SidebarItem[]): SidebarItem[] =>
  items.flatMap((item) => [item, ...(item.subItems ? flattenSidebarItems(item.subItems) : [])]);

export const getSectionPathByLabel = (
  moduleId: LearningModuleId,
  sectionLabel: string
): string | null => {
  const items = moduleNavigationSections[learningModuleConfigs[moduleId].path] ?? [];
  const match = flattenSidebarItems(items).find((item) => item.label === sectionLabel);
  return match?.path ?? null;
};
