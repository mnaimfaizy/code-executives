import React from 'react';
import SpaceBackground from '../theme/SpaceBackground';

interface PlaygroundLayoutProps {
  children: React.ReactNode;
}

const PlaygroundLayout: React.FC<PlaygroundLayoutProps> = ({ children }) => {
  return (
    <div
      data-theme="playground"
      className="fixed inset-0 overflow-hidden"
      style={{ width: '100vw', height: '100vh' }}
    >
      {/* Nebula gradient overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 50%), ' +
            'radial-gradient(ellipse at 80% 20%, rgba(0, 212, 255, 0.06) 0%, transparent 50%), ' +
            'radial-gradient(ellipse at 50% 80%, rgba(0, 255, 136, 0.04) 0%, transparent 50%)',
        }}
        aria-hidden="true"
      />

      <SpaceBackground />

      {/* Content layer */}
      <div className="relative flex flex-col h-full" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default PlaygroundLayout;
