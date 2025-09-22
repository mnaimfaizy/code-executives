// src/utils/theme.ts
// Shared theme system for consistent design across all sections

export const theme = {
  // Color schemes for different sections
  colors: {
    rxjs: {
      primary: 'purple',
      secondary: 'violet',
      accent: 'indigo',
      gradient: 'from-purple-50 via-white to-violet-50',
      border: 'purple-100',
      shadow: 'purple-200',
    },
    git: {
      primary: 'orange',
      secondary: 'red',
      accent: 'pink',
      gradient: 'from-orange-50 via-red-50 to-pink-50',
      border: 'orange-200',
      shadow: 'orange-200',
    },
    javascript: {
      primary: 'indigo',
      secondary: 'purple',
      accent: 'blue',
      gradient: 'from-indigo-50 via-white to-purple-50',
      border: 'indigo-100',
      shadow: 'indigo-200',
    },
    datastructures: {
      primary: 'blue',
      secondary: 'indigo',
      accent: 'purple',
      gradient: 'from-blue-50 via-indigo-50 to-purple-50',
      border: 'blue-200',
      shadow: 'blue-200',
    },
    react: {
      primary: 'blue',
      secondary: 'indigo',
      accent: 'cyan',
      gradient: 'from-blue-50 via-white to-indigo-50',
      border: 'blue-100',
      shadow: 'blue-200',
    },
  },
  layout: {
    // Standard section layout with hero + content grid
    section: 'mb-8',
    hero: 'bg-gradient-to-br rounded-2xl p-8 mb-8 border shadow-lg',
    contentGrid: 'grid grid-cols-1 lg:grid-cols-3 gap-8',
    mainContent: 'lg:col-span-2 space-y-6',
    sidebar: 'space-y-6',
  },

  // Component patterns
  components: {
    // Card styles
    card: {
      base: 'bg-white rounded-xl border shadow-sm',
      padding: 'p-6',
      hover: 'hover:shadow-md transition-shadow',
    },

    // Button styles
    button: {
      base: 'px-4 py-2 rounded-lg font-medium transition-colors',
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    },

    // Navigation styles
    nav: {
      card: 'p-4 rounded-lg border hover:bg-gray-50 transition-colors group',
      title: 'font-semibold group-hover:text-blue-600 transition-colors',
      description: 'text-xs text-gray-600 mt-1',
      icon: 'w-8 h-8 rounded-lg flex items-center justify-center',
    },

    // Stats card
    stats: {
      container: 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-8',
      card: 'text-center p-4 bg-white rounded-xl border shadow-sm',
      number: 'text-3xl font-bold mb-2',
      label: 'text-sm text-gray-600',
    },

    // Call-to-action section
    cta: {
      container: 'mt-8 bg-gradient-to-r rounded-2xl p-8 text-white',
      title: 'text-2xl font-bold mb-4',
      description: 'mb-6 max-w-2xl mx-auto',
      button:
        'bg-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2',
    },
  },

  // Typography
  typography: {
    h1: 'text-4xl font-bold mb-4',
    h2: 'text-3xl font-bold mb-6',
    h3: 'text-2xl font-bold mb-4',
    h4: 'text-xl font-bold mb-4',
    body: 'text-gray-700 leading-relaxed',
    caption: 'text-sm text-gray-600',
  },

  // Spacing utilities
  spacing: {
    section: 'mb-8',
    card: 'mb-6',
    element: 'mb-4',
  },
};

// Helper functions for theme application
export const getSectionTheme = (section: keyof typeof theme.colors) => theme.colors[section];

export const createCardClass = (variant: 'base' | 'hover' = 'base') =>
  `${theme.components.card.base} ${theme.components.card.padding} ${variant === 'hover' ? theme.components.card.hover : ''}`;

export const createButtonClass = (variant: 'primary' | 'secondary' | 'outline' = 'primary') =>
  `${theme.components.button.base} ${theme.components.button[variant]}`;

export const createNavCardClass = (colorScheme: string) =>
  `${theme.components.nav.card} border-${colorScheme}-200 bg-${colorScheme}-50 hover:bg-${colorScheme}-100`;

export const createStatsCardClass = (colorScheme: string) =>
  `${theme.components.stats.card} border-${colorScheme}-100`;

export const createCTAClass = (colorScheme: string) =>
  `${theme.components.cta.container} from-${colorScheme}-600 to-${colorScheme === 'purple' ? 'violet' : colorScheme === 'orange' ? 'red' : colorScheme === 'indigo' ? 'purple' : colorScheme === 'react' ? 'indigo' : 'indigo'}-600`;

// Pre-built component classes for common patterns
export const sectionClasses = {
  container: theme.layout.section,
  hero: theme.layout.hero,
  contentGrid: theme.layout.contentGrid,
  mainContent: theme.layout.mainContent,
  sidebar: theme.layout.sidebar,
};

export const componentClasses = {
  card: createCardClass(),
  cardHover: createCardClass('hover'),
  buttonPrimary: createButtonClass('primary'),
  buttonSecondary: createButtonClass('secondary'),
  buttonOutline: createButtonClass('outline'),
};
