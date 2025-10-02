import React from 'react';

export const SkipLinks: React.FC = () => (
  <div className="sr-only focus-within:not-sr-only">
    <a
      href="#main-content"
      className="fixed top-0 left-0 z-50 bg-blue-600 text-white px-4 py-2 m-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      Skip to main content
    </a>
    <a
      href="#navigation"
      className="fixed top-0 left-20 z-50 bg-blue-600 text-white px-4 py-2 m-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      Skip to navigation
    </a>
  </div>
);

export default SkipLinks;
