import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import StatsGrid from '../../components/shared/StatsGrid';

const BestPractices: React.FC = () => {
  const navigateToSection = (section: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('section', section);
    window.history.pushState({}, '', url.toString());
  };

  // Code examples as string constants
  const strictModeCode =
    '{\n  "compilerOptions": {\n    "strict": true,\n    "noImplicitAny": true,\n    "strictNullChecks": true,\n    "strictFunctionTypes": true,\n    "noImplicitReturns": true,\n    "noFallthroughCasesInSwitch": true,\n    "noUncheckedIndexedAccess": true,\n    "exactOptionalPropertyTypes": true\n  }\n}';

  const interfaceVsTypeCode =
    "// Use interfaces for object shapes that will be extended\ninterface User {\n  id: number;\n  name: string;\n}\n\ninterface Admin extends User {\n  role: string;\n  permissions: string[];\n}\n\n// Use type aliases for unions, primitives, and complex types\ntype UserId = number | string;\ntype ApiResponse<T> = {\n  data: T;\n  status: 'success' | 'error';\n  message?: string;\n};\n\ntype ComponentProps = {\n  onClick: () => void;\n  disabled?: boolean;\n} & React.HTMLAttributes<HTMLDivElement>;\n\n// Use interfaces when you need declaration merging\ninterface Window {\n  customProperty: string;\n}";

  const avoidAnyCode =
    "// ❌ Avoid using 'any'\nfunction processData(data: any): any {\n  return data.toString();\n}\n\n// ✅ Use specific types\nfunction processData(data: unknown): string {\n  if (typeof data === 'string') {\n    return data;\n  }\n  if (typeof data === 'number') {\n    return data.toString();\n  }\n  throw new Error('Unsupported data type');\n}\n\n// ✅ Use generics for flexible but type-safe code\nfunction processData<T>(data: T): string {\n  if (data && typeof data === 'object' && 'toString' in data) {\n    return data.toString();\n  }\n  return String(data);\n}\n\n// ✅ Use utility types\ntype ApiResponse<T> = {\n  data: T | null;\n  error: string | null;\n  loading: boolean;\n};\n\nfunction handleResponse<T>(response: ApiResponse<T>): T | null {\n  if (response.error) {\n    console.error(response.error);\n    return null;\n  }\n  return response.data;\n}";

  const errorHandlingCode =
    "// ✅ Use union types for error handling\ntype Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };\n\nfunction divide(a: number, b: number): Result<number> {\n  if (b === 0) {\n    return { success: false, error: new Error('Division by zero') };\n  }\n  return { success: true, data: a / b };\n}\n\n// ✅ Use try-catch with proper typing\nasync function fetchUser(id: string): Promise<Result<User>> {\n  try {\n    const response = await fetch(`/api/users/${id}`);\n    if (!response.ok) {\n      return { success: false, error: new Error(`HTTP ${response.status}`) };\n    }\n    const user: User = await response.json();\n    return { success: true, data: user };\n  } catch (error) {\n    return { success: false, error: error as Error };\n  }\n}\n\n// ✅ Use assertion functions for validation\nfunction assertIsUser(obj: any): asserts obj is User {\n  if (!obj || typeof obj !== 'object') {\n    throw new Error('Invalid user object');\n  }\n  // Additional validation...\n}\n\nfunction processUser(data: any): User {\n  assertIsUser(data);\n  // TypeScript now knows data is User\n  return data;\n}";

  const namingConventionsCode =
    "// ✅ Use PascalCase for types and interfaces\ninterface UserProfile {\n  // ...\n}\n\ntype ApiResponse<T> = {\n  // ...\n};\n\n// ✅ Use camelCase for variables and functions\nconst userProfile: UserProfile = {\n  // ...\n};\n\nfunction getUserProfile(id: string): Promise<UserProfile> {\n  // ...\n}\n\n// ✅ Use PascalCase for enum members\nenum UserRole {\n  Admin = 'ADMIN',\n  User = 'USER',\n  Guest = 'GUEST'\n}\n\n// ✅ Use descriptive names\ntype UserPermissions = {\n  canEdit: boolean;\n  canDelete: boolean;\n  canViewReports: boolean;\n};\n\n// ❌ Avoid abbreviations\ntype UserPerms = { // Less clear\n  ce: boolean;    // What does 'ce' mean?\n  cd: boolean;\n  cvr: boolean;\n};";

  const moduleOrganizationCode =
    "// ✅ Use barrel exports (index.ts)\nexport { UserService } from './UserService';\nexport { AuthService } from './AuthService';\nexport type { User, AuthToken } from './types';\n\n// ✅ Group related functionality\n// services/auth/index.ts\n// services/auth/LoginService.ts\n// services/auth/TokenService.ts\n// services/auth/types.ts\n\n// ✅ Use consistent file naming\n// UserService.ts (class)\n// userApi.ts (functions)\n// userTypes.ts (types)\n// userUtils.ts (utilities)\n\n// ✅ Separate concerns\n// components/UserProfile/UserProfile.tsx\n// components/UserProfile/UserProfile.test.tsx\n// components/UserProfile/types.ts\n// components/UserProfile/hooks/useUserProfile.ts";

  const performanceTipsCode =
    "// ✅ Use const assertions for literal types\nconst colors = ['red', 'green', 'blue'] as const;\ntype Color = typeof colors[number]; // 'red' | 'green' | 'blue'\n\n// ✅ Use satisfies operator (TypeScript 4.9+)\ntype Config = {\n  apiUrl: string;\n  timeout: number;\n  retries: number;\n};\n\nconst config = {\n  apiUrl: 'https://api.example.com',\n  timeout: 5000,\n  retries: 3,\n  debug: true // Extra property\n} satisfies Config;\n\n// ✅ Avoid unnecessary type assertions\n// ❌ Bad\nconst user = getUser() as User;\nuser.name.toUpperCase();\n\n// ✅ Good\nfunction assertIsUser(obj: any): asserts obj is User {\n  // validation logic\n}\n\nconst user = getUser();\nassertIsUser(user);\nuser.name.toUpperCase(); // TypeScript knows it's User\n\n// ✅ Use exact types when possible\ntype Point = {\n  x: number;\n  y: number;\n  // No extra properties allowed\n};\n\nconst point: Point = { x: 1, y: 2 }; // ✅\n// const point: Point = { x: 1, y: 2, z: 3 }; // ❌";

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Best Practices</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Learn essential TypeScript development practices for writing maintainable, type-safe, and
          scalable code.
        </p>
      </div>
      <StatsGrid
        stats={[
          { label: 'Type Safety', value: 'Avoid any, use strict mode' },
          { label: 'Code Organization', value: 'Consistent naming and structure' },
          { label: 'Error Handling', value: 'Proper typing for errors' },
          { label: 'Performance', value: 'Efficient type operations' },
        ]}
        colorScheme="indigo"
      />
    </div>
  );

  const mainContent = (
    <>
      {/* Type Safety */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Type Safety</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">Enable Strict Mode</h3>
            <pre className="bg-gray-900 text-indigo-400 p-4 rounded-lg text-sm overflow-x-auto">
              {strictModeCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-600 mb-3">
              Interface vs Type Aliases
            </h3>
            <pre className="bg-gray-900 text-purple-400 p-4 rounded-lg text-sm overflow-x-auto">
              {interfaceVsTypeCode}
            </pre>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-3">Avoid 'any' Type</h3>
          <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
            {avoidAnyCode}
          </pre>
        </div>
      </ThemeCard>

      {/* Error Handling */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Error Handling</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-3">Result Types</h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {errorHandlingCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-3">Naming Conventions</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
              {namingConventionsCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Code Organization */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Code Organization</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">Module Structure</h3>
            <pre className="bg-gray-900 text-indigo-400 p-4 rounded-lg text-sm overflow-x-auto">
              {moduleOrganizationCode}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-600 mb-3">Performance Tips</h3>
            <pre className="bg-gray-900 text-purple-400 p-4 rounded-lg text-sm overflow-x-auto">
              {performanceTipsCode}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* Guidelines */}
      <ThemeCard>
        <div className="p-6 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Essential Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">Do's ✅</h4>
              <ul className="text-green-600 text-sm space-y-1">
                <li>• Enable strict mode in tsconfig.json</li>
                <li>• Use interfaces for object contracts</li>
                <li>• Prefer const assertions for literals</li>
                <li>• Use meaningful variable names</li>
                <li>• Handle errors with union types</li>
                <li>• Write tests for critical logic</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-700 mb-2">Don'ts ❌</h4>
              <ul className="text-red-600 text-sm space-y-1">
                <li>• Don't use 'any' type</li>
                <li>• Don't disable strict checks</li>
                <li>• Don't ignore TypeScript errors</li>
                <li>• Don't use abbreviations in names</li>
                <li>• Don't mix types in arrays</li>
                <li>• Don't overuse type assertions</li>
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
          title="Type Guards"
          description="Runtime type checking patterns"
          colorScheme="indigo"
          onClick={() => navigateToSection('Type Guards')}
        />
      </ThemeCard>
      <ThemeCard>
        <NavigationCard
          title="Migration Guide"
          description="Converting JavaScript to TypeScript"
          colorScheme="indigo"
          onClick={() => navigateToSection('Migration Guide')}
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
        title="Ready to Migrate?"
        description="Learn how to convert your JavaScript projects to TypeScript"
        buttonText="Migration Guide"
        onButtonClick={() => navigateToSection('Migration Guide')}
        colorScheme="indigo"
      />
    </>
  );
};

export default BestPractices;
