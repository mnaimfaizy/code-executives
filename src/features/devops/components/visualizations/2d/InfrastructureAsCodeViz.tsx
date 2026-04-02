import React, { useState } from 'react';

interface IaCTool {
  id: string;
  name: string;
  icon: string;
  type: 'provisioning' | 'configuration' | 'containerization';
  description: string;
  codeExample: string;
  language: string;
}

const IAC_TOOLS: IaCTool[] = [
  {
    id: 'terraform',
    name: 'Terraform',
    icon: '🏗️',
    type: 'provisioning',
    description: 'Declarative infrastructure provisioning across cloud providers',
    language: 'HCL',
    codeExample: `resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name        = "web-server"
    Environment = "production"
  }
}

resource "aws_lb" "main" {
  name               = "app-lb"
  load_balancer_type = "application"
  subnets            = var.public_subnets
}`,
  },
  {
    id: 'ansible',
    name: 'Ansible',
    icon: '⚙️',
    type: 'configuration',
    description: 'Agentless configuration management and automation',
    language: 'YAML',
    codeExample: `- name: Configure Web Server
  hosts: webservers
  become: yes
  tasks:
    - name: Install Nginx
      apt:
        name: nginx
        state: present

    - name: Start Nginx
      service:
        name: nginx
        state: started
        enabled: yes

    - name: Deploy Application
      copy:
        src: ./dist/
        dest: /var/www/html/`,
  },
  {
    id: 'docker',
    name: 'Dockerfile',
    icon: '🐳',
    type: 'containerization',
    description: 'Container image definition for reproducible environments',
    language: 'Dockerfile',
    codeExample: `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
HEALTHCHECK CMD curl -f http://localhost:3000/health
CMD ["node", "server.js"]`,
  },
];

const InfrastructureAsCodeViz: React.FC = () => {
  const [activeTool, setActiveTool] = useState('terraform');
  const [showDriftDemo, setShowDriftDemo] = useState(false);

  const tool = IAC_TOOLS.find((t) => t.id === activeTool) || IAC_TOOLS[0];

  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-slate-50 via-white to-cyan-50 rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Infrastructure as Code</h3>
          <p className="text-sm text-gray-600">Define, version, and automate your infrastructure</p>
        </div>

        {/* IaC workflow diagram */}
        <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl p-4 mb-6 border border-indigo-100">
          <svg
            viewBox="0 0 800 120"
            className="w-full h-auto"
            aria-label="Infrastructure as Code workflow"
          >
            {[
              { x: 60, icon: '📝', label: 'Write Code', color: '#6366f1' },
              { x: 220, icon: '📋', label: 'Plan', color: '#818cf8' },
              { x: 380, icon: '✅', label: 'Review', color: '#3b82f6' },
              { x: 540, icon: '🚀', label: 'Apply', color: '#10b981' },
              { x: 700, icon: '🔍', label: 'Verify', color: '#0ea5e9' },
            ].map((step, i, arr) => (
              <g key={i}>
                <circle
                  cx={step.x}
                  cy="50"
                  r="28"
                  fill={`${step.color}15`}
                  stroke={step.color}
                  strokeWidth="2"
                />
                <text x={step.x} y="48" textAnchor="middle" fontSize="18">
                  {step.icon}
                </text>
                <text
                  x={step.x}
                  y="95"
                  textAnchor="middle"
                  fill="#374151"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="system-ui"
                >
                  {step.label}
                </text>
                {i < arr.length - 1 && (
                  <line
                    x1={step.x + 30}
                    y1="50"
                    x2={arr[i + 1].x - 30}
                    y2="50"
                    stroke={step.color}
                    strokeWidth="2"
                    opacity="0.4"
                    markerEnd="url(#arrowIaC)"
                  />
                )}
              </g>
            ))}
            <defs>
              <marker
                id="arrowIaC"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* Tool selector */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {IAC_TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
                activeTool === t.id
                  ? 'bg-slate-800 text-white border-slate-600 shadow-md scale-105'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <span>{t.icon}</span>
              {t.name}
            </button>
          ))}
        </div>

        {/* Code preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Code editor mockup */}
          <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border-b border-slate-700">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-slate-400 text-xs ml-2">
                {tool.name.toLowerCase()}.
                {tool.language === 'HCL'
                  ? 'tf'
                  : tool.language === 'YAML'
                    ? 'yml'
                    : tool.language.toLowerCase()}
              </span>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-72">
              <code>{tool.codeExample}</code>
            </pre>
          </div>

          {/* Info panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{tool.icon}</span>
                <div>
                  <h4 className="font-bold text-gray-900">{tool.name}</h4>
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                    {tool.type}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{tool.description}</p>
            </div>

            {/* Drift detection demo */}
            <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
              <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                <span>🔄</span> Configuration Drift
              </h4>
              <p className="text-sm text-gray-700 mb-3">
                {showDriftDemo
                  ? 'Drift detected! Someone manually changed a server setting. IaC tools detect this and can auto-remediate.'
                  : 'Infrastructure can "drift" from its defined state when manual changes are made.'}
              </p>
              <button
                onClick={() => setShowDriftDemo(!showDriftDemo)}
                className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  showDriftDemo
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                }`}
              >
                {showDriftDemo ? '✅ Remediated!' : '⚠️ Simulate Drift'}
              </button>
            </div>

            {/* Key benefit */}
            <div className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-xl p-5 border border-sky-200">
              <h4 className="font-bold text-sky-900 mb-2">🎯 Why IaC?</h4>
              <ul className="space-y-1.5 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-sky-500">✓</span> Version controlled like application code
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-500">✓</span> Reproducible environments every time
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-500">✓</span> Automated provisioning in minutes, not
                  days
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-500">✓</span> Peer-reviewed infrastructure changes
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(InfrastructureAsCodeViz);
