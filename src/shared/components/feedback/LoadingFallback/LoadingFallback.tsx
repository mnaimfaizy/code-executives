import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
  message?: string;
  variant?: 'spinner' | 'minimal';
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'Loading...',
  variant = 'spinner',
}) => {
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
