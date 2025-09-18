import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onSidebarToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSidebarToggle }) => (
  <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
    <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
      <button
        aria-label="Open menu"
        onClick={onSidebarToggle}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex flex-1 items-center justify-between">
        <Link to="/" className="font-semibold tracking-tight text-gray-900">
          Code Executives
        </Link>
        <nav className="hidden items-center gap-2 sm:flex">
          <Link
            to="/"
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Home
          </Link>
          <Link
            to="/javascript"
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            JavaScript
          </Link>
          <Link
            to="/rxjs"
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            RxJS
          </Link>
          <Link
            to="/about"
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            About
          </Link>
        </nav>
      </div>
    </div>
  </header>
);

export default Header;
