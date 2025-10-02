import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import CTASection from '../../../../components/shared/CTASection';
import RequestPipeline2D from '../visualizations/2d/RequestPipeline2D';
import EdgeNetwork from '../visualizations/2d/EdgeNetwork';
import HandlerFlow from '../visualizations/2d/HandlerFlow';
import MiddlewareSimulator from '../visualizations/2d/MiddlewareSimulator';
import RouteBuilder from '../visualizations/2d/RouteBuilder';
import PipelineViewer from '../visualizations/2d/PipelineViewer';

const Middleware: React.FC = () => {
  // Section statistics
  const stats = [
    {
      label: 'Middleware Types',
      value: '5+',
      description: 'Authentication, CORS, Rate Limiting, etc.',
    },
    { label: 'Route Handlers', value: 'REST & GraphQL', description: 'Full API endpoint support' },
    { label: 'Edge Runtime', value: 'Global', description: 'Deploy anywhere, run everywhere' },
    { label: 'Performance', value: '<100ms', description: 'Sub-second response times' },
  ];

  // Hero content
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Middleware & Route Handlers</h1>
        <p className="text-xl text-gray-700 leading-relaxed mb-6">
          Master Next.js middleware for request processing and API route handlers for building
          robust, scalable web applications with global performance.
        </p>
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">What You'll Learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <ul className="space-y-2 text-gray-700">
              <li>• Request pipeline processing</li>
              <li>• Authentication & authorization</li>
              <li>• CORS and security headers</li>
              <li>• Rate limiting strategies</li>
            </ul>
            <ul className="space-y-2 text-gray-700">
              <li>• API route construction</li>
              <li>• Edge runtime deployment</li>
              <li>• Global CDN distribution</li>
              <li>• Performance optimization</li>
            </ul>
          </div>
        </div>
      </div>
      <StatsGrid stats={stats} colorScheme="primary" />
    </div>
  );

  // Main content
  const mainContent = (
    <>
      {/* Introduction */}
      <ThemeCard className="mb-8">
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Understanding Middleware</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Middleware in Next.js provides powerful request processing capabilities that run before
            your route handlers. They enable authentication, security headers, rate limiting, and
            request transformation across your entire application.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Features</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>
                    <strong>Edge Runtime:</strong> Run at the network edge for minimal latency
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>
                    <strong>Global Distribution:</strong> Deploy worldwide with instant updates
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>
                    <strong>Type Safety:</strong> Full TypeScript support with intellisense
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>
                    <strong>Flexible Matching:</strong> Pathname, headers, and custom logic
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Common Use Cases</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>
                    <strong>Authentication:</strong> JWT validation and user sessions
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>
                    <strong>Security:</strong> CORS headers and XSS protection
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>
                    <strong>Performance:</strong> Caching and request optimization
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>
                    <strong>Analytics:</strong> Request logging and monitoring
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Interactive Visualizations */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Interactive Learning</h2>

        {/* Request Pipeline Visualization */}
        <ThemeCard>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Request Pipeline Flow</h3>
            <p className="text-gray-600 mb-4">
              Watch how requests flow through middleware layers before reaching your route handlers.
            </p>
          </div>
          <RequestPipeline2D middlewareType="complex" />
        </ThemeCard>

        {/* Edge Network Visualization */}
        <ThemeCard>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Edge Network</h3>
            <p className="text-gray-600 mb-4">
              See how middleware runs at the network edge, closer to your users worldwide.
            </p>
          </div>
          <EdgeNetwork region="global" />
        </ThemeCard>

        {/* Route Handler Flow */}
        <ThemeCard>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Route Handler Execution</h3>
            <p className="text-gray-600 mb-4">
              Understand how API routes process requests and return responses.
            </p>
          </div>
          <HandlerFlow handlerType="rest" method="GET" />
        </ThemeCard>

        {/* Middleware Simulator */}
        <ThemeCard>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Middleware Simulator</h3>
            <p className="text-gray-600 mb-4">
              Experiment with different middleware rules and see how they affect request processing.
            </p>
          </div>
          <MiddlewareSimulator middlewareRules={[]} showLogs={true} />
        </ThemeCard>

        {/* Route Builder */}
        <ThemeCard>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">API Route Builder</h3>
            <p className="text-gray-600 mb-4">
              Construct complete API routes with parameters, request bodies, and responses.
            </p>
          </div>
          <RouteBuilder />
        </ThemeCard>

        {/* Pipeline Viewer */}
        <ThemeCard>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Request Lifecycle Monitor</h3>
            <p className="text-gray-600 mb-4">
              Monitor the complete request lifecycle from middleware to response.
            </p>
          </div>
          <PipelineViewer autoPlay={false} />
        </ThemeCard>
      </div>

      {/* Best Practices */}
      <ThemeCard className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Best Practices</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Middleware Guidelines</h3>
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2">Execution Order Matters</h4>
                <p className="text-indigo-800 text-sm">
                  Middleware runs in the order defined. Place authentication before business logic,
                  and security headers early in the pipeline.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Keep it Lightweight</h4>
                <p className="text-purple-800 text-sm">
                  Middleware runs on every request. Avoid heavy computations, database calls, or
                  complex logic that could slow down your application.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Use Appropriate Matching</h4>
                <p className="text-green-800 text-sm">
                  Be specific with your matcher patterns. Broad matches can impact performance and
                  make debugging difficult.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Route Handler Patterns</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Consistent Response Format</h4>
                <p className="text-blue-800 text-sm">
                  Use consistent response structures across all endpoints. Include proper status
                  codes, error messages, and data formatting.
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Input Validation</h4>
                <p className="text-yellow-800 text-sm">
                  Always validate and sanitize input data. Use libraries like Zod for runtime type
                  checking and validation.
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">Error Handling</h4>
                <p className="text-red-800 text-sm">
                  Implement comprehensive error handling. Don't expose internal errors to clients,
                  and provide meaningful error messages for debugging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Code Examples */}
      <ThemeCard className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Code Examples</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Basic Middleware</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
              {`// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add CORS headers
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

export const config = {
  matcher: '/api/:path*',
};`}
            </pre>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Authentication Middleware</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
              {`// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token (simplified)
  try {
    // const payload = verifyJWT(token);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/admin/:path*'],
};`}
            </pre>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">API Route Handler</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
              {`// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch users from database
    const users = await getUsers({ page, limit });

    return NextResponse.json({
      data: users,
      pagination: { page, limit, total: users.length }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Create user
    const user = await createUser(body);

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}`}
            </pre>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar content
  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="font-semibold text-gray-900 mb-3">Quick Navigation</h3>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 rounded hover:bg-indigo-50 text-indigo-700 transition-colors">
            Request Pipeline
          </button>
          <button className="w-full text-left px-3 py-2 rounded hover:bg-indigo-50 text-indigo-700 transition-colors">
            Edge Network
          </button>
          <button className="w-full text-left px-3 py-2 rounded hover:bg-indigo-50 text-indigo-700 transition-colors">
            Route Handlers
          </button>
          <button className="w-full text-left px-3 py-2 rounded hover:bg-indigo-50 text-indigo-700 transition-colors">
            Middleware Simulator
          </button>
          <button className="w-full text-left px-3 py-2 rounded hover:bg-indigo-50 text-indigo-700 transition-colors">
            Route Builder
          </button>
          <button className="w-full text-left px-3 py-2 rounded hover:bg-indigo-50 text-indigo-700 transition-colors">
            Pipeline Monitor
          </button>
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="font-semibold text-gray-900 mb-3">Key Concepts</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Middleware runs before routes</li>
          <li>• Edge Runtime for performance</li>
          <li>• Request/Response transformation</li>
          <li>• Global CDN deployment</li>
          <li>• Type-safe API development</li>
        </ul>
      </ThemeCard>

      <ThemeCard>
        <h3 className="font-semibold text-gray-900 mb-3">Performance Tips</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Minimize middleware logic</li>
          <li>• Use streaming for large responses</li>
          <li>• Cache frequently accessed data</li>
          <li>• Optimize database queries</li>
          <li>• Monitor response times</li>
        </ul>
      </ThemeCard>
    </>
  );

  return (
    <>
      <SectionLayout
        section="nextjs"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />

      <CTASection
        title="Ready to Build Production-Ready APIs?"
        description="Apply middleware and route handler patterns to create scalable, secure, and performant web applications."
        buttonText="Explore More Next.js Features"
        onButtonClick={() => console.log('Navigate to next section')}
        colorScheme="primary"
      />
    </>
  );
};

export default Middleware;
