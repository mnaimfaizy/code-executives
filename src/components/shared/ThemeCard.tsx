// src/components/shared/ThemeCard.tsx
// Shared card component with consistent theming

import React from 'react';
import { createCardClass } from '../../utils/theme';

interface ThemeCardProps {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ children, hover = false, className = '' }) => {
  const cardClass = hover ? createCardClass('hover') : createCardClass();

  return <div className={`${cardClass} ${className}`}>{children}</div>;
};

export default ThemeCard;
