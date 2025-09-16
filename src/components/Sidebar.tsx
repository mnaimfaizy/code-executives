import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const sidebarSections: Record<string, Array<{ label: string; path: string }>> = {
  '/javascript': [
    { label: 'Introduction', path: '/javascript?section=Introduction' },
    { label: 'Engine & Runtime', path: '/javascript?section=Engine%20%26%20Runtime' },
    { label: 'Execution Model', path: '/javascript?section=Execution%20Model' },
    { label: 'Event Loop', path: '/javascript?section=Event%20Loop' },
    { label: 'Call Stack', path: '/javascript?section=Call%20Stack' },
    { label: 'Memory Heap', path: '/javascript?section=Memory%20Heap' },
    { label: 'Memory Management', path: '/javascript?section=Memory%20Management' },
    { label: 'Visualization', path: '/javascript?section=Visualization' },
  ],
  '/': [],
  '/about': [],
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const location = useLocation();
  // Get the base path (e.g., '/javascript')
  const basePath = location.pathname;
  const sections = sidebarSections[basePath] || [];

  return (
    <aside
      aria-hidden={!open}
      className={[
        // Base drawer behavior for small/medium screens
        'fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-60 border-r bg-white shadow-sm transition-transform duration-200 ease-out',
        open ? 'translate-x-0' : '-translate-x-full',
        // On large screens and up, make it always visible and static (no translate)
        'lg:translate-x-0 lg:static lg:top-auto lg:h-auto lg:min-h-[calc(100vh-4rem)]',
      ].join(' ')}
    >
      <nav className="p-2">
        <ul className="space-y-1">
          {sections.map(({ label, path }) => (
            <li key={label}>
              <Link
                to={path}
                onClick={onClose}
                className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
