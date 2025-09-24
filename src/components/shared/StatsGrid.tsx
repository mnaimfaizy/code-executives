// src/components/shared/StatsGrid.tsx
// Shared stats grid component for hero sections

import React from 'react';
import { createStatsCardClass } from '../../utils/theme';

interface StatItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface StatsGridProps {
  stats: StatItem[];
  colorScheme: string;
  className?: string;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats, colorScheme, className = '' }) => {
  const statsClass = createStatsCardClass(colorScheme);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 ${className}`}>
      {stats.map((stat, index) => (
        <div key={index} className={statsClass}>
          <div
            className={`text-3xl font-bold text-${colorScheme}-600 mb-2 flex items-center gap-2`}
          >
            {stat.icon && <span className="text-lg">{stat.icon}</span>}
            {stat.value}
          </div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
