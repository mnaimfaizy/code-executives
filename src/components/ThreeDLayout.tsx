import React from 'react';

interface ThreeDLayoutProps {
  title: string;
  canvas: React.ReactNode;
  controlPanel: React.ReactNode;
  scenarioDescription: React.ReactNode;
}

const ThreeDLayout: React.FC<ThreeDLayoutProps> = ({
  title,
  canvas,
  controlPanel,
  scenarioDescription,
}) => {
  return (
    <div className="space-y-4">
      {/* Scenario Description */}
      {scenarioDescription}

      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-300 p-3">
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* 3D Canvas - Takes most of the space */}
          <div className="flex-1 relative">{canvas}</div>

          {/* Control Panel - Sidebar on desktop, bottom on mobile */}
          <div className="w-full lg:w-80 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-300">
            {controlPanel}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDLayout;
