import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import StatsGrid from '../../../../components/shared/StatsGrid';

const MigrationGuide: React.FC = () => {
  const navigateToSection = (section: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('section', section);
    window.history.pushState({}, '', url.toString());
  };

  // Code examples as string constants
  const tsconfigSetupCode =
    '{\n  "compilerOptions": {\n    "target": "ES2020",\n    "module": "ESNext",\n    "lib": ["ES2020", "DOM", "DOM.Iterable"],\n    "allowJs": true,\n    "checkJs": false,\n    "outDir": "./dist",\n    "rootDir": "./src",\n    "strict": false,\n    "noImplicitAny": false,\n    "esModuleInterop": true,\n    "skipLibCheck": true,\n    "forceConsistentCasingInFileNames": true,\n    "moduleResolution": "node",\n    "resolveJsonModule": true,\n    "isolatedModules": true,\n    "noEmit": true,\n    "jsx": "react-jsx"\n  },\n  "include": ["src/**/*"],\n  "exclude": ["node_modules", "dist"]\n}';

  const gradualMigrationCode =
    "// Step 1: Rename .js to .ts (don't change code yet)\n// user.js -> user.ts\n\nfunction getUser(id) {\n  return { id, name: 'John' };\n}\n\n// Step 2: Add JSDoc comments for type hints\n/**\n * @param {string} id\n * @returns {{id: string, name: string}}\n */\nfunction getUser(id) {\n  return { id, name: 'John' };\n}\n\n// Step 3: Convert to TypeScript types\nfunction getUser(id: string): { id: string; name: string } {\n  return { id, name: 'John' };\n}\n\n// Step 4: Create interfaces for complex objects\ninterface User {\n  id: string;\n  name: string;\n  email?: string;\n}\n\nfunction getUser(id: string): User {\n  return { id, name: 'John' };\n}";

  const commonJsToEsModulesCode =
    "// CommonJS (JavaScript)\nconst express = require('express');\nconst { getUser } = require('./user');\nconst helper = require('./helper');\n\nmodule.exports = { app: express() };\n\n// ES Modules (TypeScript)\nimport express from 'express';\nimport { getUser } from './user';\nimport * as helper from './helper';\n\nexport const app = express();\n\nexport default express();\n\n// For types, you might need to install @types packages\n// npm install --save-dev @types/express\n// npm install --save-dev @types/node";

  const propTypesToTypesCode =
    "// React with PropTypes\nimport PropTypes from 'prop-types';\nimport React from 'react';\n\nfunction UserCard({ user, onClick }) {\n  return <div onClick={onClick}>{user.name}</div>;\n}\n\nUserCard.propTypes = {\n  user: PropTypes.shape({\n    id: PropTypes.string.isRequired,\n    name: PropTypes.string.isRequired,\n    age: PropTypes.number\n  }).isRequired,\n  onClick: PropTypes.func.isRequired\n};\n\nexport default UserCard;\n\n// TypeScript with interfaces\nimport React from 'react';\n\ninterface User {\n  id: string;\n  name: string;\n  age?: number;\n}\n\ninterface UserCardProps {\n  user: User;\n  onClick: () => void;\n}\n\nconst UserCard: React.FC<UserCardProps> = ({ user, onClick }) => {\n  return <div onClick={onClick}>{user.name}</div>;\n};\n\nexport default UserCard;";

  const anyToSpecificTypesCode =
    "// Start with 'any' types (allowJs: true)\nfunction processData(data: any): any {\n  if (data && typeof data === 'object') {\n    return data.name || 'Unknown';\n  }\n  return String(data);\n}\n\n// Gradually add specific types\nfunction processData(data: unknown): string {\n  if (data && typeof data === 'object' && data !== null) {\n    // Type guard for object\n    const obj = data as Record<string, unknown>;\n    if (typeof obj.name === 'string') {\n      return obj.name;\n    }\n  }\n  if (typeof data === 'string') {\n    return data;\n  }\n  if (typeof data === 'number') {\n    return data.toString();\n  }\n  return 'Unknown';\n}\n\n// Define proper interfaces\ninterface Person {\n  name: string;\n  age?: number;\n}\n\nfunction processData(data: Person | string | number): string {\n  if (typeof data === 'string') {\n    return data;\n  }\n  if (typeof data === 'number') {\n    return data.toString();\n  }\n  if (typeof data === 'object' && data !== null) {\n    return data.name;\n  }\n  return 'Unknown';\n}";

  const thirdPartyLibrariesCode =
    "// For libraries without types, create declaration files\n// types/lodash.d.ts\ndeclare module 'lodash' {\n  export function debounce<T extends (...args: any[]) => any>(\n    func: T,\n    wait?: number,\n    options?: {\n      leading?: boolean;\n      trailing?: boolean;\n    }\n  ): T & { cancel(): void; flush(): void };\n}\n\n// Or use @types packages\n// npm install --save-dev @types/lodash\n\nimport { debounce } from 'lodash';\n\nconst debouncedFunction = debounce(() => {\n  console.log('Called after delay');\n}, 300);\n\n// For untyped libraries, use 'any' temporarily\n// utils/legacy-lib.d.ts\ndeclare module 'legacy-lib' {\n  const legacyLib: any;\n  export default legacyLib;\n}";

  const buildConfigurationCode =
    '// package.json scripts\n{\n  "scripts": {\n    "build": "tsc",\n    "dev": "tsc --watch",\n    "start": "node dist/index.js",\n    "type-check": "tsc --noEmit"\n  }\n}\n\n// tsconfig.json for different environments\n// Development: lenient settings\n{\n  "compilerOptions": {\n    "strict": false,\n    "noImplicitAny": false\n  }\n}\n\n// Production: strict settings\n{\n  "compilerOptions": {\n    "strict": true,\n    "noImplicitAny": true,\n    "noImplicitReturns": true\n  }\n}\n\n// Use extends for different configs\n// tsconfig.dev.json\n{\n  "extends": "./tsconfig.json",\n  "compilerOptions": {\n    "strict": false\n  }\n}';

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Migration Guide</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Learn how to gradually convert your JavaScript projects to TypeScript with minimal
          disruption.
        </p>
      </div>
      <StatsGrid
        stats={[
          { label: 'Gradual Adoption', value: 'Migrate file by file' },
          { label: 'Type Safety', value: 'Add types incrementally' },
          { label: 'Tooling Support', value: 'IDE assistance throughout' },
          { label: 'Zero Breaking Changes', value: 'Existing code continues to work' },
        ]}
        colorScheme="indigo"
      />
    </div>
  );

  const mainContent = (
    <>
      {/* Initial Setup */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Initial Setup</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">TypeScript Configuration</h3>
            <pre className="bg-gray-900 text-indigo-400 p-4 rounded-lg text-sm overflow-x-auto">
              {tsconfigSetupCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-600 mb-3">
              Gradual Migration Strategy
            </h3>
            <pre className="bg-gray-900 text-purple-400 p-4 rounded-lg text-sm overflow-x-auto">
              {gradualMigrationCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Module Systems */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Module Systems</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-3">CommonJS to ES Modules</h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {commonJsToEsModulesCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-3">PropTypes to TypeScript</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
              {propTypesToTypesCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Type Migration */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Type Migration</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">
              From 'any' to Specific Types
            </h3>
            <pre className="bg-gray-900 text-indigo-400 p-4 rounded-lg text-sm overflow-x-auto">
              {anyToSpecificTypesCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-600 mb-3">Third-party Libraries</h3>
            <pre className="bg-gray-900 text-purple-400 p-4 rounded-lg text-sm overflow-x-auto">
              {thirdPartyLibrariesCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Build Configuration */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Build Configuration</h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-3">
              Build Scripts and Environments
            </h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {buildConfigurationCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Migration Checklist */}
      <ThemeCard>
        <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">Migration Checklist</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-yellow-700 mb-3">Phase 1: Setup</h4>
              <ul className="text-yellow-600 text-sm space-y-1">
                <li>✓ Install TypeScript</li>
                <li>✓ Create tsconfig.json</li>
                <li>✓ Set allowJs: true</li>
                <li>✓ Configure build scripts</li>
                <li>✓ Install @types packages</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-700 mb-3">Phase 2: Migration</h4>
              <ul className="text-yellow-600 text-sm space-y-1">
                <li>✓ Rename .js to .ts files</li>
                <li>✓ Add JSDoc type comments</li>
                <li>✓ Convert to TypeScript types</li>
                <li>✓ Create interfaces</li>
                <li>✓ Enable strict mode gradually</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-700 mb-3">Phase 3: Enhancement</h4>
              <ul className="text-yellow-600 text-sm space-y-1">
                <li>✓ Add generics where appropriate</li>
                <li>✓ Implement type guards</li>
                <li>✓ Use utility types</li>
                <li>✓ Add comprehensive tests</li>
                <li>✓ Update documentation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-700 mb-3">Phase 4: Optimization</h4>
              <ul className="text-yellow-600 text-sm space-y-1">
                <li>✓ Enable full strict mode</li>
                <li>✓ Remove any remaining 'any' types</li>
                <li>✓ Optimize build performance</li>
                <li>✓ Update CI/CD pipelines</li>
                <li>✓ Train team on TypeScript</li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <>
      <ThemeCard>
        <NavigationCard
          title="Best Practices"
          description="TypeScript development guidelines"
          colorScheme="indigo"
          onClick={() => navigateToSection('Best Practices')}
        />
      </ThemeCard>
      <ThemeCard>
        <NavigationCard
          title="Advanced Types"
          description="Complex type compositions"
          colorScheme="indigo"
          onClick={() => navigateToSection('Advanced Types')}
        />
      </ThemeCard>
      <ThemeCard>
        <NavigationCard
          title="Generics"
          description="Reusable type-safe components"
          colorScheme="indigo"
          onClick={() => navigateToSection('Generics')}
        />
      </ThemeCard>
    </>
  );

  return (
    <>
      <SectionLayout
        section="typescript"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Explore Advanced Features"
        description="Learn about complex type compositions and utility types"
        buttonText="Advanced Types"
        onButtonClick={() => navigateToSection('Advanced Types')}
        colorScheme="indigo"
      />
    </>
  );
};

export default MigrationGuide;
