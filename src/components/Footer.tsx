import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
  <footer className="border-t bg-white">
    <div className="mx-auto max-w-7xl px-4 py-3 text-center text-sm text-gray-600 sm:px-6 lg:px-8">
      © 2025 Code Executives. All rights reserved. |
      <Link to="/about" className="ml-1 underline underline-offset-4">
        About
      </Link>
    </div>
  </footer>
);

export default Footer;
