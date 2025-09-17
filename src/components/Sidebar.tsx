import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItem {
  label: string;
  path: string;
  subItems?: SidebarItem[];
}

const sidebarSections: Record<string, Array<SidebarItem>> = {
  '/javascript': [
    { label: 'Introduction', path: '/javascript?section=Introduction' },
    { label: 'JavaScript History', path: '/javascript?section=JavaScript%20History' },
    { label: 'Engine & Runtime', path: '/javascript?section=Engine%20%26%20Runtime' },
    { label: 'Execution Model', path: '/javascript?section=Execution%20Model' },
    { label: 'Event Loop', path: '/javascript?section=Event%20Loop' },
    { label: 'Call Stack', path: '/javascript?section=Call%20Stack' },
    { label: 'Memory Heap', path: '/javascript?section=Memory%20Heap' },
    {
      label: 'Memory Management',
      path: '/javascript?section=Memory%20Management',
      subItems: [{ label: 'Memory Leaks', path: '/javascript?section=Memory%20Leaks' }],
    },
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
  const [expandedItems, setExpandedItems] = useState<string[]>(['Memory Management']);

  // Get the base path (e.g., '/javascript')
  const basePath = location.pathname;
  const sections = sidebarSections[basePath] || [];

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isExpanded = (label: string) => expandedItems.includes(label);

  const renderMenuItem = (item: SidebarItem, isSubItem = false) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const expanded = isExpanded(item.label);

    return (
      <li key={item.label}>
        <div className="flex items-center">
          <Link
            to={item.path}
            onClick={onClose}
            className={`flex-1 block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
              isSubItem ? 'ml-4 text-xs' : ''
            }`}
          >
            {item.label}
          </Link>
          {hasSubItems && (
            <button
              onClick={() => toggleExpanded(item.label)}
              className="p-1 text-gray-500 hover:text-gray-700 rounded"
              aria-label={`${expanded ? 'Collapse' : 'Expand'} ${item.label}`}
            >
              <svg
                className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
        {hasSubItems && expanded && (
          <ul className="mt-1 space-y-1">
            {item.subItems?.map((subItem) => renderMenuItem(subItem, true))}
          </ul>
        )}
      </li>
    );
  };

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
        <ul className="space-y-1">{sections.map((item) => renderMenuItem(item))}</ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
