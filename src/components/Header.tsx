import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Code, GitBranch, Database } from 'lucide-react';

interface HeaderProps {
  onSidebarToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSidebarToggle }) => {
  const location = useLocation();

  const navigationItems = [
    {
      label: 'Home',
      path: '/',
      icon: null,
    },
    {
      label: 'JavaScript',
      path: '/javascript',
      icon: <Code className="w-4 h-4" />,
    },
    {
      label: 'Git',
      path: '/git',
      icon: <GitBranch className="w-4 h-4" />,
    },
    {
      label: 'Data Structures',
      path: '/datastructures',
      icon: <Database className="w-4 h-4" />,
    },
    {
      label: 'About',
      path: '/about',
      icon: null,
    },
  ];

  const getActiveColor = (path: string) => {
    if (path === '/javascript') return 'text-indigo-600 bg-indigo-50';
    if (path === '/git') return 'text-orange-600 bg-orange-50';
    if (path === '/datastructures') return 'text-blue-600 bg-blue-50';
    return 'text-gray-700 hover:bg-gray-50';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          aria-label="Open menu"
          onClick={onSidebarToggle}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 lg:hidden transition-colors"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>

        <div className="flex flex-1 items-center justify-between">
          <Link
            to="/"
            className="font-bold tracking-tight text-gray-900 hover:text-indigo-600 transition-colors flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl">Code Executives</span>
          </Link>

          <nav className="hidden items-center gap-2 sm:flex">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              const activeColor = getActiveColor(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? `${activeColor} shadow-sm`
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.icon && (
                    <span className={isActive ? '' : 'text-gray-500'}>{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
