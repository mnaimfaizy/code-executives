import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import CTASection from '../../../../components/shared/CTASection';
import FrameworksViz from '../visualizations/2d/FrameworksViz';
import { Lightbulb } from 'lucide-react';

const Frameworks: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    window.location.href = '/nodejs?section=' + encodeURIComponent(sectionName);
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        🌐 Server Frameworks: Express, Fastify, NestJS & More
      </h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        Node.js&apos;s HTTP module is low-level by design. Frameworks add routing, middleware,
        validation, and structure so you can build APIs and web apps productively. Each one makes
        different trade-offs between simplicity, performance, and architecture.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Restaurant analogy */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200 mb-8">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">The Restaurant Analogy 🍽️</h3>
            <p className="text-gray-700 leading-relaxed">
              Node.js&apos;s <code className="bg-gray-100 px-1 rounded text-sm">http</code> module
              is a<strong> kitchen</strong> — it can cook, but you need to manage everything
              yourself. Frameworks are like different restaurant concepts built on top:{' '}
              <strong>Express</strong> is a casual diner (simple, flexible),{' '}
              <strong>Fastify</strong> is a fast-food chain (optimized throughput),{' '}
              <strong>NestJS</strong> is a fine-dining establishment (structured, full-service), and{' '}
              <strong>Koa</strong> is a food truck (minimal, modern).
            </p>
          </div>
        </div>
      </div>

      {/* Visualization */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Interactive Framework Comparison</h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Click each framework tab to explore its architecture, key features, code style, and
          performance characteristics.
        </p>
        <FrameworksViz />
      </ThemeCard>

      {/* Framework Deep Dives */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📚 Framework Deep Dives</h2>
        <div className="space-y-6">
          {/* Express */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">⚡</span>
              <h3 className="text-xl font-bold text-gray-900">Express.js</h3>
              <span className="text-sm bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                Minimalist
              </span>
            </div>
            <p className="text-gray-700 mb-3 leading-relaxed">
              The original Node.js framework (2010). Dominates with 64k+ GitHub stars and the
              largest middleware ecosystem. Its middleware pipeline pattern defined how we build
              Node.js web apps.
            </p>
            <div className="bg-gray-900 rounded-lg p-4 mb-3">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{`const express = require('express');
const app = express();

// Middleware chain
app.use(express.json());
app.use(cors());
app.use(helmet());

// Route handler
app.get('/api/users/:id', async (req, res) => {
  const user = await db.findUser(req.params.id);
  res.json(user);
});

app.listen(3000);`}</pre>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Huge ecosystem
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Easy to learn
              </span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                No built-in validation
              </span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                Slower than alternatives
              </span>
            </div>
          </div>

          {/* Fastify */}
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🚀</span>
              <h3 className="text-xl font-bold text-gray-900">Fastify</h3>
              <span className="text-sm bg-blue-200 px-2 py-0.5 rounded-full text-blue-700">
                Performance
              </span>
            </div>
            <p className="text-gray-700 mb-3 leading-relaxed">
              Built for speed. Uses JSON Schema validation and serialization for 2-3× throughput
              over Express. Plugin-based architecture with encapsulation. Handles 78k requests/sec.
            </p>
            <div className="bg-gray-900 rounded-lg p-4 mb-3">
              <pre className="text-xs text-blue-400 font-mono whitespace-pre-wrap">{`import Fastify from 'fastify';
const app = Fastify({ logger: true });

// JSON Schema for auto-validation + serialization
app.get('/api/users/:id', {
  schema: {
    params: { type: 'object', properties: {
      id: { type: 'string' }
    }},
    response: { 200: {
      type: 'object',
      properties: { name: { type: 'string' } }
    }}
  }
}, async (req) => {
  return await db.findUser(req.params.id);
});

app.listen({ port: 3000 });`}</pre>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                2-3× faster than Express
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Built-in validation
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                TypeScript support
              </span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                Smaller ecosystem
              </span>
            </div>
          </div>

          {/* NestJS */}
          <div className="bg-red-50 rounded-xl p-5 border border-red-200">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🏗️</span>
              <h3 className="text-xl font-bold text-gray-900">NestJS</h3>
              <span className="text-sm bg-red-200 px-2 py-0.5 rounded-full text-red-700">
                Enterprise
              </span>
            </div>
            <p className="text-gray-700 mb-3 leading-relaxed">
              Angular-inspired framework with decorators, dependency injection, and modules. Uses
              Express or Fastify under the hood. Ideal for large team projects needing structure and
              consistency.
            </p>
            <div className="bg-gray-900 rounded-lg p-4 mb-3">
              <pre className="text-xs text-red-400 font-mono whitespace-pre-wrap">{`@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService
  ) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiResponse({ status: 200, type: UserDto })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}`}</pre>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                DI + Modules
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                TypeScript-first
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Microservices
              </span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                Steeper learning curve
              </span>
            </div>
          </div>

          {/* Koa & Hono */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🎯</span>
                <h3 className="text-lg font-bold text-gray-900">Koa</h3>
              </div>
              <p className="text-gray-700 mb-3 text-sm leading-relaxed">
                By the Express creators. Ultra-minimal core with native async/await. No built-in
                routing or body parsing — you compose everything from middleware.
              </p>
              <div className="bg-gray-900 rounded-lg p-3">
                <pre className="text-xs text-purple-400 font-mono whitespace-pre-wrap">{`const Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', ms);
});`}</pre>
              </div>
            </div>
            <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🔥</span>
                <h3 className="text-lg font-bold text-gray-900">Hono</h3>
              </div>
              <p className="text-gray-700 mb-3 text-sm leading-relaxed">
                Ultrafast, Web Standards-based framework. Runs everywhere — Node.js, Deno, Bun,
                Cloudflare Workers, edge functions. Only 14 KB, but includes routing and middleware.
              </p>
              <div className="bg-gray-900 rounded-lg p-3">
                <pre className="text-xs text-orange-400 font-mono whitespace-pre-wrap">{`import { Hono } from 'hono';
const app = new Hono();

app.get('/api/hello', (c) => {
  return c.json({ msg: 'Hello!' });
});

export default app; // Any runtime`}</pre>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* When to Choose */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Decision Guide</h2>
        <div className="space-y-3">
          {[
            {
              scenario: 'Quick API prototype',
              pick: 'Express or Hono',
              reason: 'Least boilerplate, most tutorials',
            },
            {
              scenario: 'High-throughput REST API',
              pick: 'Fastify',
              reason: 'Best raw performance with request validation',
            },
            {
              scenario: 'Large enterprise backend',
              pick: 'NestJS',
              reason: 'DI, modules, and opinionated structure scale well',
            },
            {
              scenario: 'Minimal custom middleware',
              pick: 'Koa',
              reason: 'Cleanest async/await composition model',
            },
            {
              scenario: 'Multi-runtime / Edge',
              pick: 'Hono',
              reason: 'Runs on Node, Deno, Bun, CF Workers without changes',
            },
          ].map((item) => (
            <div key={item.scenario} className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
              <span className="text-green-500 font-bold mt-0.5">→</span>
              <div>
                <span className="font-semibold text-gray-800">{item.scenario}:</span>{' '}
                <span className="text-green-700 font-medium">{item.pick}</span>
                <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>
    </>
  );

  return (
    <>
      <SectionLayout section="nodejs" hero={heroContent} mainContent={mainContent} />
      <CTASection
        title="Next: Runtime Wars"
        description="Compare Node.js, Deno, and Bun — and see what the future of server-side JavaScript looks like."
        buttonText="Continue to Runtime Wars →"
        onButtonClick={() => navigateToSection('Runtime Wars')}
        colorScheme="green"
      />
    </>
  );
};

export default Frameworks;
