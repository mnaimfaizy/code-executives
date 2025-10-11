import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  Code,
  GitBranch,
  Database,
  Atom,
  Globe,
  TrendingUp,
  Terminal,
  Network,
  X,
  ChevronDown,
  BookOpen,
  Boxes,
} from 'lucide-react';
import { useUI } from '../shared/contexts';

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  description?: string;
}

interface NavigationGroup {
  label: string;
  icon: React.ReactNode;
  items: NavigationItem[];
}

const Header: React.FC = () => {
  const location = useLocation();
  const { toggleSidebar } = useUI();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Group navigation items by category
  const navigationGroups: NavigationGroup[] = [
    {
      label: 'Languages',
      icon: <Code className="w-4 h-4" />,
      items: [
        {
          label: 'JavaScript',
          path: '/javascript',
          icon: <Code className="w-4 h-4" />,
          description: 'Learn JavaScript execution flow',
        },
        {
          label: 'TypeScript',
          path: '/typescript',
          icon: <Code className="w-4 h-4" />,
          description: 'Master TypeScript type system',
        },
        {
          label: 'Python',
          path: '/python',
          icon: <Terminal className="w-4 h-4" />,
          description: 'Explore Python fundamentals',
        },
      ],
    },
    {
      label: 'Frameworks',
      icon: <Boxes className="w-4 h-4" />,
      items: [
        {
          label: 'React',
          path: '/react',
          icon: <Atom className="w-4 h-4" />,
          description: 'React concepts and patterns',
        },
        {
          label: 'Next.js',
          path: '/nextjs',
          icon: <Globe className="w-4 h-4" />,
          description: 'Next.js full-stack framework',
        },
      ],
    },
    {
      label: 'Fundamentals',
      icon: <BookOpen className="w-4 h-4" />,
      items: [
        {
          label: 'Data Structures',
          path: '/datastructures',
          icon: <Database className="w-4 h-4" />,
          description: 'Essential data structures',
        },
        {
          label: 'Big-O Notation',
          path: '/bigo',
          icon: <TrendingUp className="w-4 h-4" />,
          description: 'Algorithm complexity analysis',
        },
        {
          label: 'System Design',
          path: '/systemdesign',
          icon: <Network className="w-4 h-4" />,
          description: 'Scalable system architecture',
        },
        {
          label: 'Git',
          path: '/git',
          icon: <GitBranch className="w-4 h-4" />,
          description: 'Version control mastery',
        },
      ],
    },
  ];

  const primaryNavItems = [
    { label: 'Home', path: '/', icon: null },
    { label: 'About', path: '/about', icon: null },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const getActiveColor = (path: string) => {
    if (path === '/javascript' || path === '/typescript') return 'text-indigo-600 bg-indigo-50';
    if (path === '/python' || path === '/react' || path === '/nextjs')
      return 'text-blue-600 bg-blue-50';
    if (path === '/git') return 'text-orange-600 bg-orange-50';
    if (path === '/datastructures' || path === '/systemdesign') return 'text-blue-600 bg-blue-50';
    if (path === '/bigo') return 'text-purple-600 bg-purple-50';
    return 'text-gray-700 hover:bg-gray-50';
  };

  const isPathActive = (path: string) => location.pathname === path;

  const isGroupActive = (group: NavigationGroup) =>
    group.items.some((item) => location.pathname === item.path);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile Sidebar Toggle */}
        <button
          aria-label="Open sidebar"
          aria-expanded={false}
          onClick={toggleSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 lg:hidden transition-colors"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>

        <div className="flex flex-1 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="font-bold tracking-tight text-gray-900 hover:text-indigo-600 transition-colors flex items-center space-x-2"
            aria-label="Code Executives Home"
          >
            <img
              src="/logo.png"
              alt="Code Executives Logo"
              className="w-8 h-8 rounded-lg shadow-md"
            />
            <span className="text-xl hidden sm:inline">Code Executives</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2" ref={dropdownRef}>
            {primaryNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isPathActive(item.path)
                    ? `${getActiveColor(item.path)} shadow-sm`
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon && (
                  <span className={isPathActive(item.path) ? '' : 'text-gray-500'}>
                    {item.icon}
                  </span>
                )}
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Dropdown Menus */}
            {navigationGroups.map((group) => (
              <div key={group.label} className="relative">
                <button
                  onClick={() => toggleDropdown(group.label)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleDropdown(group.label);
                    }
                  }}
                  className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isGroupActive(group)
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  aria-expanded={activeDropdown === group.label}
                  aria-haspopup="true"
                >
                  {group.icon}
                  <span>{group.label}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      activeDropdown === group.label ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Content */}
                {activeDropdown === group.label && (
                  <div
                    className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    role="menu"
                  >
                    {group.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-start space-x-3 px-4 py-3 transition-colors ${
                          isPathActive(item.path)
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'hover:bg-gray-50'
                        }`}
                        role="menuitem"
                      >
                        <span
                          className={`mt-0.5 ${
                            isPathActive(item.path) ? 'text-indigo-600' : 'text-gray-400'
                          }`}
                        >
                          {item.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-medium text-sm ${
                              isPathActive(item.path) ? 'text-indigo-700' : 'text-gray-900'
                            }`}
                          >
                            {item.label}
                          </div>
                          {item.description && (
                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-gray-600" />
            ) : (
              <Menu className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Mobile Menu */}
          <div
            className="fixed top-16 left-0 right-0 h-[calc(100vh-4rem)] bg-white z-50 overflow-y-auto lg:hidden animate-in slide-in-from-top-4 duration-300"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <nav className="px-4 py-6 space-y-6 min-h-full">
              {/* Primary Items */}
              <div className="space-y-2">
                {primaryNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                      isPathActive(item.path)
                        ? `${getActiveColor(item.path)} shadow-sm`
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Grouped Items */}
              {navigationGroups.map((group) => (
                <div key={group.label} className="space-y-2">
                  <div className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {group.icon}
                    <span>{group.label}</span>
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-start space-x-3 rounded-lg px-4 py-3 transition-colors ${
                          isPathActive(item.path)
                            ? `${getActiveColor(item.path)} shadow-sm`
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="mt-0.5">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{item.label}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
