// src/components/shared/NavigationCard.tsx
// Shared navigation card component for sidebar sections

import React from 'react';
import { createNavCardClass } from '../../utils/theme';

interface NavigationCardProps {
  title: string;
  description: string;
  colorScheme: string;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
}

const NavigationCard: React.FC<NavigationCardProps> = ({
  title,
  description,
  colorScheme,
  icon,
  onClick,
  className = '',
}) => {
  const navClass = createNavCardClass(colorScheme);

  return (
    <button onClick={onClick} className={`${navClass} ${className} w-full text-left group`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
            {title}
          </h4>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </div>
        {icon && (
          <div
            className={`w-8 h-8 bg-${colorScheme}-200 rounded-lg flex items-center justify-center ml-3`}
          >
            {icon}
          </div>
        )}
      </div>
    </button>
  );
};

export default NavigationCard;
