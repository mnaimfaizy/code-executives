import React from 'react';
import ThemeCard from '../../../../components/shared/ThemeCard';
import ContainerOrchestrationViz from '../visualizations/2d/ContainerOrchestrationViz';
import { Container, Lightbulb, CheckCircle, Box } from 'lucide-react';

const ContainerOrchestration: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-sky-50 via-white to-cyan-50 rounded-2xl p-8 border border-sky-100 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-sky-100 p-3 rounded-full">
            <Container className="w-8 h-8 text-sky-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Container Orchestration</h1>
            <p className="text-gray-600">Docker, Kubernetes &amp; Container Management</p>
          </div>
        </div>
        <p className="text-lg text-gray-700 leading-relaxed">
          Containers package your code with everything it needs to run — the same way every time,
          everywhere. Orchestrators like Kubernetes manage fleets of containers at scale,
          automatically handling scaling, healing, and load balancing.
        </p>
      </div>

      {/* Interactive Kubernetes Simulation */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Kubernetes Pod Simulator</h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Scale pods up and down, watch auto-scaling in action, and see how Kubernetes maintains
          desired state even when pods fail.
        </p>
        <ContainerOrchestrationViz />
      </ThemeCard>

      {/* Docker Fundamentals */}
      <div className="grid md:grid-cols-2 gap-6">
        <ThemeCard>
          <div className="flex items-center gap-3 mb-4">
            <Box className="w-6 h-6 text-sky-600" />
            <h3 className="text-xl font-bold text-gray-900">Docker Fundamentals</h3>
          </div>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Docker packages applications into <strong>containers</strong> — lightweight, isolated
            environments that include everything needed to run: code, runtime, libraries, and system
            tools.
          </p>
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
            <div className="text-gray-500"># Dockerfile example</div>
            <div>
              <span className="text-cyan-400">FROM</span> node:20-alpine
            </div>
            <div>
              <span className="text-cyan-400">WORKDIR</span> /app
            </div>
            <div>
              <span className="text-cyan-400">COPY</span> package*.json ./
            </div>
            <div>
              <span className="text-cyan-400">RUN</span> npm ci --production
            </div>
            <div>
              <span className="text-cyan-400">COPY</span> . .
            </div>
            <div>
              <span className="text-cyan-400">EXPOSE</span> 3000
            </div>
            <div>
              <span className="text-cyan-400">CMD</span> [&quot;node&quot;, &quot;server.js&quot;]
            </div>
          </div>
        </ThemeCard>

        <ThemeCard>
          <div className="flex items-center gap-3 mb-4">
            <Container className="w-6 h-6 text-emerald-600" />
            <h3 className="text-xl font-bold text-gray-900">Container vs. VM</h3>
          </div>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Containers share the host OS kernel, making them much lighter than virtual machines. A
            VM needs its own full OS — containers just need the application layers.
          </p>
          <div className="space-y-3">
            <div className="bg-sky-50 rounded-lg p-3 border border-sky-200">
              <h4 className="font-semibold text-sky-800 text-sm mb-1">Containers 📦</h4>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>✅ Start in milliseconds</li>
                <li>✅ MBs in size (vs. GBs)</li>
                <li>✅ Share host OS kernel</li>
                <li>✅ Run 100s per host</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <h4 className="font-semibold text-gray-800 text-sm mb-1">Virtual Machines 🖥️</h4>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>⚠️ Start in minutes</li>
                <li>⚠️ GBs in size</li>
                <li>✅ Full OS isolation</li>
                <li>⚠️ Run 10–20 per host</li>
              </ul>
            </div>
          </div>
        </ThemeCard>
      </div>

      {/* Kubernetes Concepts */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Kubernetes Core Concepts</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              title: 'Pod',
              desc: 'Smallest deployable unit. Contains one or more containers that share network and storage.',
              icon: '🫛',
            },
            {
              title: 'Deployment',
              desc: 'Declares desired state (e.g., "run 3 replicas"). K8s ensures reality matches the declaration.',
              icon: '📋',
            },
            {
              title: 'Service',
              desc: 'Stable network endpoint that routes traffic to pods. Pods come and go, the Service stays.',
              icon: '🌐',
            },
            {
              title: 'Ingress',
              desc: 'HTTP routing layer. Maps external URLs to internal services with TLS termination.',
              icon: '🚪',
            },
            {
              title: 'ConfigMap / Secret',
              desc: 'Decouple configuration from code. Secrets are base64-encoded and access-controlled.',
              icon: '🔐',
            },
            {
              title: 'Namespace',
              desc: 'Virtual cluster within a cluster. Isolate environments (dev, staging, prod) on shared infra.',
              icon: '📁',
            },
          ].map((concept, i) => (
            <div key={i} className="bg-sky-50 rounded-xl p-4 border border-sky-200">
              <span className="text-2xl">{concept.icon}</span>
              <h4 className="font-bold text-gray-900 mt-2 mb-1">{concept.title}</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{concept.desc}</p>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Container Tools Ecosystem */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Container Ecosystem</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Docker', category: 'Runtime', color: 'sky' },
            { name: 'Kubernetes', category: 'Orchestration', color: 'sky' },
            { name: 'Helm', category: 'Package Mgr', color: 'cyan' },
            { name: 'Istio', category: 'Service Mesh', color: 'cyan' },
            { name: 'Podman', category: 'Runtime (rootless)', color: 'teal' },
            { name: 'containerd', category: 'Container Runtime', color: 'teal' },
            { name: 'Docker Compose', category: 'Local Dev', color: 'emerald' },
            { name: 'Rancher', category: 'K8s Management', color: 'emerald' },
          ].map((tool, i) => (
            <div
              key={i}
              className={`bg-${tool.color}-50 rounded-lg p-3 border border-${tool.color}-200 text-center`}
            >
              <h4 className="font-semibold text-gray-900 text-sm">{tool.name}</h4>
              <span className="text-xs text-gray-600">{tool.category}</span>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Best Practices */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-emerald-600" /> Container Best Practices
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              practice: 'Use multi-stage builds',
              why: 'Keep images small — build in one stage, copy artifacts to a minimal runtime image',
            },
            {
              practice: 'One process per container',
              why: 'Containers should do one thing well — easier to scale, debug, and replace',
            },
            {
              practice: 'Never run as root',
              why: 'Use USER directive in Dockerfile to run as non-root for security',
            },
            {
              practice: 'Use health checks',
              why: 'HEALTHCHECK instruction lets K8s know when to restart unhealthy containers',
            },
            {
              practice: 'Pin image versions',
              why: 'Use node:20.11-alpine, not node:latest — avoid surprise breaking changes',
            },
            {
              practice: 'Scan for vulnerabilities',
              why: 'Use tools like Trivy, Snyk, or Docker Scout to find CVEs in your images',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200"
            >
              <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">{item.practice}</h4>
                <p className="text-xs text-gray-600 mt-1">{item.why}</p>
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* ELI10 */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">
              Think of it like a shipping port 🚢
            </h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>Docker containers</strong> are like shipping containers — they hold everything
              your app needs in a standard box that works on any ship (server).{' '}
              <strong>Kubernetes</strong> is the port authority — it decides which containers go on
              which ships, replaces damaged containers, and makes sure everything arrives on time.
              If one ship sinks, K8s moves the containers to another ship automatically!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContainerOrchestration;
