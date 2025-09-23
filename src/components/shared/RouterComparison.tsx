import React from 'react';

interface FeatureComparison {
  feature: string;
  pagesRouter: string | boolean;
  appRouter: string | boolean;
  description: string;
}

const RouterComparison: React.FC = () => {
  const features: FeatureComparison[] = [
    {
      feature: 'Directory Structure',
      pagesRouter: 'pages/',
      appRouter: 'app/',
      description: 'Where routes are defined',
    },
    {
      feature: 'Routing Method',
      pagesRouter: 'File-based',
      appRouter: 'Folder-based',
      description: 'How routes are created',
    },
    {
      feature: 'Components Default',
      pagesRouter: 'Client Components',
      appRouter: 'Server Components',
      description: 'Default component type',
    },
    {
      feature: 'Data Fetching',
      pagesRouter: 'getServerSideProps, getStaticProps',
      appRouter: 'fetch() API',
      description: 'How to fetch data',
    },
    {
      feature: 'Layouts',
      pagesRouter: '_app.js (global)',
      appRouter: 'layout.js (nested)',
      description: 'Shared UI patterns',
    },
    {
      feature: 'Loading States',
      pagesRouter: 'Custom implementation',
      appRouter: 'loading.js file',
      description: 'Loading UI handling',
    },
    {
      feature: 'Error Boundaries',
      pagesRouter: 'Custom implementation',
      appRouter: 'error.js file',
      description: 'Error handling',
    },
    {
      feature: 'Streaming',
      pagesRouter: false,
      appRouter: true,
      description: 'Progressive rendering',
    },
    {
      feature: 'Middleware',
      pagesRouter: 'middleware.js',
      appRouter: 'middleware.js',
      description: 'Request processing',
    },
    {
      feature: 'API Routes',
      pagesRouter: 'pages/api/',
      appRouter: 'app/api/',
      description: 'Backend endpoints',
    },
  ];

  const renderValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <span className="text-green-600 font-semibold">✓</span>
      ) : (
        <span className="text-gray-400">—</span>
      );
    }
    return <span className="text-sm">{value}</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200 rounded-lg">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">
              Feature
            </th>
            <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-orange-600">
              Pages Router
            </th>
            <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-blue-600">
              App Router
            </th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={feature.feature} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900">
                {feature.feature}
              </td>
              <td className="border border-gray-200 px-4 py-3 text-center">
                {renderValue(feature.pagesRouter)}
              </td>
              <td className="border border-gray-200 px-4 py-3 text-center">
                {renderValue(feature.appRouter)}
              </td>
              <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">
                {feature.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Migration Recommendation</h4>
        <p className="text-sm text-blue-800">
          For new projects, use the <strong>App Router</strong>. For existing Pages Router projects,
          consider migrating gradually as the App Router offers better performance and developer
          experience.
        </p>
      </div>
    </div>
  );
};

export default RouterComparison;
