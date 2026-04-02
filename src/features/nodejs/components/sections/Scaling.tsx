import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import CTASection from '../../../../components/shared/CTASection';
import ClusterVsWorkerViz from '../visualizations/2d/ClusterVsWorkerViz';
import { Lightbulb } from 'lucide-react';

const Scaling: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    window.location.href = '/nodejs?section=' + encodeURIComponent(sectionName);
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        📈 Scaling Node.js: Clusters &amp; Worker Threads
      </h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        Node.js is single-threaded, but your server has 8+ CPU cores. Learn how to use all of them
        with the Cluster module and Worker Threads — two complementary scaling strategies.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Office analogy */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200 mb-8">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">The Office Analogy 🏢</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>Clustering</strong> is like opening multiple branch offices. Each branch
              (worker process) has its own staff, supplies, and phone line. A reception desk (master
              process) routes incoming calls to whichever branch is free.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Worker Threads</strong> is like hiring more employees in the <em>same</em>{' '}
              office. They share the copy machine and coffee maker (memory), pass notes to each
              other (message passing), and can even work on a shared whiteboard (SharedArrayBuffer).
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Visualization */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Interactive Cluster vs Worker Threads Comparison
        </h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Switch between Cluster mode and Worker Threads to see how each approach distributes work
          across CPU cores, handles crashes, and shares (or isolates) memory.
        </p>
        <ClusterVsWorkerViz />
      </ThemeCard>

      {/* Comparison Table */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🔍 Side-by-Side Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-gray-800">Feature</th>
                <th className="text-left py-3 px-4 text-blue-700">Cluster Module</th>
                <th className="text-left py-3 px-4 text-purple-700">Worker Threads</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  feature: 'Process Model',
                  cluster: 'Multiple processes (fork)',
                  worker: 'Single process, multiple threads',
                },
                {
                  feature: 'Memory',
                  cluster: 'Isolated (separate V8 heaps)',
                  worker: 'Shared (SharedArrayBuffer)',
                },
                {
                  feature: 'Communication',
                  cluster: 'IPC messages (serialized)',
                  worker: 'postMessage + SharedArrayBuffer',
                },
                {
                  feature: 'Crash Impact',
                  cluster: 'One worker dies → others live',
                  worker: 'Thread crash → process dies',
                },
                {
                  feature: 'Memory Usage',
                  cluster: 'Higher (full V8 per worker)',
                  worker: 'Lower (shared process memory)',
                },
                {
                  feature: 'Best For',
                  cluster: 'HTTP servers, load balancing',
                  worker: 'CPU-heavy computation',
                },
                {
                  feature: 'Port Sharing',
                  cluster: 'Yes (master distributes)',
                  worker: 'No (single port per process)',
                },
                {
                  feature: 'Available Since',
                  cluster: 'Node.js v0.8 (2012)',
                  worker: 'Node.js v12 stable (2019)',
                },
              ].map((row, i) => (
                <tr key={row.feature} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-3 px-4 font-medium text-gray-800">{row.feature}</td>
                  <td className="py-3 px-4 text-gray-700">{row.cluster}</td>
                  <td className="py-3 px-4 text-gray-700">{row.worker}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ThemeCard>

      {/* When to Use */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 When to Use What?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Use Cluster for:</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                🌐 <strong>HTTP servers</strong> — distribute requests across cores
              </li>
              <li>
                🔄 <strong>Stateless APIs</strong> — each worker handles independent requests
              </li>
              <li>
                🛡️ <strong>High availability</strong> — workers can restart on crash
              </li>
              <li>
                📊 <strong>Horizontal scaling</strong> — easy path to multi-core utilization
              </li>
            </ul>
            <div className="bg-gray-900 rounded-lg p-3 mt-4 border border-blue-700/30">
              <pre className="text-xs text-blue-400 font-mono whitespace-pre-wrap">{`const cluster = require('cluster');
const os = require('os');

if (cluster.isPrimary) {
  // Fork one worker per CPU core
  os.cpus().forEach(() => cluster.fork());
  cluster.on('exit', (w) => cluster.fork());
} else {
  require('./server'); // Each runs HTTP
}`}</pre>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">Use Worker Threads for:</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                🧮 <strong>CPU-heavy work</strong> — image processing, crypto, data parsing
              </li>
              <li>
                🧵 <strong>Shared memory</strong> — when workers need to read same data
              </li>
              <li>
                ⚙️ <strong>Background tasks</strong> — offload computation from event loop
              </li>
              <li>
                📐 <strong>Parallel algorithms</strong> — divide and conquer strategies
              </li>
            </ul>
            <div className="bg-gray-900 rounded-lg p-3 mt-4 border border-purple-700/30">
              <pre className="text-xs text-purple-400 font-mono whitespace-pre-wrap">{`const { Worker } = require('worker_threads');

const worker = new Worker('./heavy-task.js', {
  workerData: { input: bigData }
});

worker.on('message', (result) => {
  console.log('Done!', result);
});`}</pre>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* PM2 */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🚀 PM2: Production Process Manager
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          In production, most teams use <strong>PM2</strong> instead of manually writing cluster
          code. PM2 handles process management, auto-restart, load balancing, and monitoring out of
          the box.
        </p>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">{`# Start with max cluster instances
pm2 start app.js -i max

# Monitor all processes
pm2 monit

# Zero-downtime reload
pm2 reload app

# List all processes
pm2 list`}</pre>
        </div>
      </ThemeCard>
    </>
  );

  return (
    <>
      <SectionLayout section="nodejs" hero={heroContent} mainContent={mainContent} />
      <CTASection
        title="Next: Memory Management"
        description="Learn how V8 manages memory, garbage collection, and how to prevent memory leaks."
        buttonText="Continue to Memory Management →"
        onButtonClick={() => navigateToSection('Memory Management')}
        colorScheme="green"
      />
    </>
  );
};

export default Scaling;
