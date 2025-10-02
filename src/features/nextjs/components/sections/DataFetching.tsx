import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import CTASection from '../../../../components/shared/CTASection';
import DataFlow2D from '../visualizations/2d/DataFlow2D';
import CacheVisualization from '../visualizations/2d/CacheVisualization';
import MutationFlow from '../visualizations/2d/MutationFlow';

const DataFetching: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/nextjs?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  // Hero content
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Data Fetching in Next.js</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Master the art of fetching and mutating data with Next.js - from simple API calls to
          advanced Server Actions
        </p>
      </div>
      <StatsGrid
        stats={[
          { value: '3', label: 'Data fetching methods' },
          { value: 'Server', label: 'Components first' },
          { value: 'Cached', label: 'Automatic optimization' },
        ]}
        colorScheme="nextjs"
      />
    </div>
  );

  // Main content
  const mainContent = (
    <>
      {/* Data Fetching Revolution */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">📡</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">The Data Fetching Revolution</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Traditional React applications fetch data in the browser using{' '}
            <strong>useEffect</strong> and client-side libraries. Next.js flips this paradigm by
            encouraging <strong>Server Components</strong> to fetch data directly on the server.
          </p>
          <p>
            This approach eliminates client-server waterfalls, reduces bundle size, and provides
            automatic request memoization. Combined with <strong>Server Actions</strong>, Next.js
            offers a complete data management solution that works seamlessly across server and
            client boundaries.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-blue-800">
              <strong>Key Insight:</strong> Server Components can fetch data directly, eliminating
              the need for client-side data fetching libraries and reducing JavaScript bundle size.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Fetch API in Server Components */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">🌐</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Fetch API in Server Components</h2>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Server-Side Fetching</h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  Server Components can use the native <strong>fetch()</strong> API to request data
                  directly on the server. This eliminates client-server waterfalls and provides
                  better performance.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Benefits:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• No client-side JavaScript for data fetching</li>
                    <li>• Automatic request deduplication</li>
                    <li>• Better SEO and initial page load</li>
                    <li>• Reduced bundle size</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Request Memoization</h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  Next.js automatically <strong>memoizes fetch requests</strong> during the same
                  render pass. Identical requests are deduplicated, improving performance and
                  reducing server load.
                </p>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">How it works:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Same URL and options = same request</li>
                    <li>• Results cached for the render</li>
                    <li>• No duplicate API calls</li>
                    <li>• Automatic optimization</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Code Example</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Server Component with Fetch</h4>
                <div className="bg-white p-4 rounded border text-sm font-mono overflow-x-auto">
                  {`// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600 } // ISR with 1 hour cache
  });

  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }

  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts(); // Fetched on server

  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}`}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Error Handling</h4>
                <div className="bg-white p-4 rounded border text-sm font-mono overflow-x-auto">
                  {`// app/posts/error.tsx
'use client';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="error-boundary">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}`}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Data Flow Demo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Interactive Demo: Data Flow
            </h3>
            <p className="text-blue-800 mb-4">
              Watch how data flows through a Next.js application with server-side fetching and
              caching.
            </p>
            <DataFlow2D cacheStrategy="isr" />
          </div>
        </div>
      </ThemeCard>

      {/* Server Actions */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">⚡</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Server Actions</h2>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">What are Server Actions?</h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>Server Actions</strong> are asynchronous functions that run on the server.
                  They can be called from Client Components using the <code>'use server'</code>{' '}
                  directive, enabling server-side mutations without API routes.
                </p>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Perfect for:</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Form submissions</li>
                    <li>• Database mutations</li>
                    <li>• File uploads</li>
                    <li>• Server-side validation</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Progressive Enhancement</h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  Server Actions work with and without JavaScript. Forms submit normally when JS is
                  disabled, and enhance to use Server Actions when JavaScript is available.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Benefits:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• No API routes needed for mutations</li>
                    <li>• Automatic form handling</li>
                    <li>• Server-side validation</li>
                    <li>• Progressive enhancement</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Server Action Examples</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Form Submission</h4>
                <div className="bg-white p-4 rounded border text-sm font-mono overflow-x-auto">
                  {`// app/actions.ts
'use server';

export async function createPost(formData: FormData) {
  const title = formData.get('title');
  const content = formData.get('content');

  // Server-side validation
  if (!title || !content) {
    throw new Error('Title and content are required');
  }

  // Database mutation
  const post = await db.post.create({
    data: { title, content }
  });

  // Revalidate the posts page
  revalidatePath('/posts');

  return { success: true, post };
}

// app/create-post/page.tsx
import { createPost } from '../actions';

export default function CreatePost() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Post title" />
      <textarea name="content" placeholder="Post content" />
      <button type="submit">Create Post</button>
    </form>
  );
}`}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Client Component Integration</h4>
                <div className="bg-white p-4 rounded border text-sm font-mono overflow-x-auto">
                  {`// app/like-button.tsx
'use client';

import { likePost } from '../actions';

export function LikeButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => likePost(postId))}
      disabled={isPending}
    >
      {isPending ? 'Liking...' : 'Like'}
    </button>
  );
}

// app/actions.ts
'use server';

export async function likePost(postId: string) {
  await db.post.update({
    where: { id: postId },
    data: { likes: { increment: 1 } }
  });

  revalidatePath('/');
}`}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Mutation Demo */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">
              Interactive Demo: Server Action Lifecycle
            </h3>
            <p className="text-purple-800 mb-4">
              See how Server Actions handle mutations from trigger to cache revalidation.
            </p>
            <MutationFlow actionType="form" showCode={true} />
          </div>
        </div>
      </ThemeCard>

      {/* Caching Strategies */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">💾</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Caching Strategies</h2>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Request Memoization</h3>
              <p className="text-sm text-blue-800 mb-3">
                Automatic deduplication of identical requests during the same render.
              </p>
              <div className="text-xs text-blue-700">
                <strong>Duration:</strong> Single render pass
                <br />
                <strong>Scope:</strong> Server-side only
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Full Route Cache</h3>
              <p className="text-sm text-green-800 mb-3">
                Complete HTML output cached at the route level for instant responses.
              </p>
              <div className="text-xs text-green-700">
                <strong>Duration:</strong> Configurable
                <br />
                <strong>Scope:</strong> Route segments
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Data Cache</h3>
              <p className="text-sm text-purple-800 mb-3">
                Individual fetch requests cached with configurable revalidation.
              </p>
              <div className="text-xs text-purple-700">
                <strong>Duration:</strong> Time-based
                <br />
                <strong>Scope:</strong> Individual requests
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cache Configuration Examples
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Static Data (Rarely Changes)</h4>
                <div className="bg-white p-3 rounded border text-sm font-mono">
                  {`fetch('https://api.example.com/static-data', {
  next: { revalidate: false } // Never revalidate
})`}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Dynamic Data (ISR)</h4>
                <div className="bg-white p-3 rounded border text-sm font-mono">
                  {`fetch('https://api.example.com/posts', {
  next: { revalidate: 3600 } // Revalidate every hour
})`}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Real-time Data</h4>
                <div className="bg-white p-3 rounded border text-sm font-mono">
                  {`fetch('https://api.example.com/live-data', {
  next: { revalidate: 0 } // Always fetch fresh
})`}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Cache Demo */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-900 mb-4">
              Interactive Demo: Cache Behavior
            </h3>
            <p className="text-orange-800 mb-4">
              Explore how different caching strategies affect performance and data freshness.
            </p>
            <CacheVisualization cacheType="isr" />
          </div>
        </div>
      </ThemeCard>

      {/* Best Practices */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Best Practices & Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Data Fetching</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Fetch data in Server Components when possible</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Use appropriate cache strategies for data freshness</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Handle errors gracefully with Error Boundaries</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Avoid client-side data fetching waterfalls</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Server Actions</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Use Server Actions for mutations and form handling</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Validate data on the server, not just client</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Use revalidatePath() to update cached pages</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Handle loading states with useTransition</span>
              </li>
            </ul>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar content
  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Data Fetching Methods</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Server Components"
            description="Fetch API in server components"
            colorScheme="nextjs"
            onClick={() => {}}
          />
          <NavigationCard
            title="Server Actions"
            description="Server-side mutations"
            colorScheme="nextjs"
            onClick={() => {}}
          />
          <NavigationCard
            title="Caching Strategies"
            description="Request memoization & ISR"
            colorScheme="nextjs"
            onClick={() => {}}
          />
          <NavigationCard
            title="Error Handling"
            description="Boundaries & fallbacks"
            colorScheme="nextjs"
            onClick={() => {}}
          />
        </div>
      </ThemeCard>

      {/* Quick Reference */}
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Reference</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Server Components</p>
              <p className="text-xs text-gray-600 mt-1">Use fetch() directly in async components</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Server Actions</p>
              <p className="text-xs text-gray-600 mt-1">'use server' for mutations and forms</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Caching</p>
              <p className="text-xs text-gray-600 mt-1">Configure revalidate for data freshness</p>
            </div>
          </div>
        </div>
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
        title="Explore Middleware & Route Handlers"
        description="Learn how Next.js handles requests with middleware and API routes for advanced server-side functionality."
        buttonText="Next: Middleware"
        onButtonClick={() => navigateToSection('Middleware & Route Handlers')}
        colorScheme="nextjs"
      />
    </>
  );
};

export default DataFetching;
