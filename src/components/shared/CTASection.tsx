// src/components/shared/CTASection.tsx
// Shared call-to-action section component

import React from 'react';
import { createCTAClass, createButtonClass } from '../../utils/theme';

interface CTASectionProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  colorScheme: string;
  className?: string;
}

const CTASection: React.FC<CTASectionProps> = ({
  title,
  description,
  buttonText,
  onButtonClick,
  colorScheme,
  className = '',
}) => {
  const ctaClass = createCTAClass(colorScheme);
  const buttonClass = createButtonClass('secondary');

  return (
    <div className={`${ctaClass} ${className}`}>
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-gray-100 mb-6 max-w-2xl mx-auto">{description}</p>
        <button onClick={onButtonClick} className={`${buttonClass} text-${colorScheme}-600`}>
          <span>{buttonText}</span>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CTASection;
