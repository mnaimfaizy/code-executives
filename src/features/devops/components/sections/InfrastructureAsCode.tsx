import React from 'react';
import ThemeCard from '../../../../components/shared/ThemeCard';
import InfrastructureAsCodeViz from '../visualizations/2d/InfrastructureAsCodeViz';
import { FileCode, Lightbulb, CheckCircle, AlertTriangle } from 'lucide-react';

const InfrastructureAsCode: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-sky-50 via-white to-cyan-50 rounded-2xl p-8 border border-sky-100 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-sky-100 p-3 rounded-full">
            <FileCode className="w-8 h-8 text-sky-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Infrastructure as Code</h1>
            <p className="text-gray-600">Terraform, Ansible, CloudFormation &amp; GitOps</p>
          </div>
        </div>
        <p className="text-lg text-gray-700 leading-relaxed">
          Infrastructure as Code (IaC) treats infrastructure like software — define servers,
          networks, and databases in code files that are version-controlled, code-reviewed, and
          automatically provisioned. No more clicking through console GUIs.
        </p>
      </div>

      {/* Interactive IaC Visualization */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">IaC Tools &amp; Workflow</h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Explore different IaC tools, see example configurations, and understand the plan → apply →
          detect drift → reconcile workflow.
        </p>
        <InfrastructureAsCodeViz />
      </ThemeCard>

      {/* Declarative vs Imperative */}
      <div className="grid md:grid-cols-2 gap-6">
        <ThemeCard>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" /> Declarative (WHAT)
          </h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            You describe the <strong>desired end state</strong> — the tool figures out how to get
            there. If the infrastructure already matches, nothing happens (idempotent).
          </p>
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
            <div className="text-gray-500"># Terraform (declarative)</div>
            <div>
              <span className="text-purple-400">resource</span>{' '}
              <span className="text-yellow-300">&quot;aws_instance&quot;</span>{' '}
              <span className="text-yellow-300">&quot;web&quot;</span> {'{'}
            </div>
            <div>
              {' '}
              ami = <span className="text-yellow-300">&quot;ami-0c55b31&quot;</span>
            </div>
            <div>
              {' '}
              instance_type = <span className="text-yellow-300">&quot;t3.micro&quot;</span>
            </div>
            <div> tags = {'{'}</div>
            <div>
              {' '}
              Name = <span className="text-yellow-300">&quot;web-server&quot;</span>
            </div>
            <div> {'}'}</div>
            <div>{'}'}</div>
          </div>
          <div className="mt-3 bg-emerald-50 rounded-lg p-3 border border-emerald-200">
            <span className="text-sm text-emerald-700 font-medium">
              Tools: Terraform, CloudFormation, Pulumi, Kubernetes YAML
            </span>
          </div>
        </ThemeCard>

        <ThemeCard>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Imperative (HOW)
          </h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            You write <strong>step-by-step instructions</strong> — the tool executes them in order.
            More flexible but harder to make idempotent; order matters.
          </p>
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
            <div className="text-gray-500"># Ansible (imperative tasks)</div>
            <div>
              - <span className="text-cyan-400">name</span>: Install nginx
            </div>
            <div>
              {' '}
              <span className="text-cyan-400">apt</span>:
            </div>
            <div>
              {' '}
              <span className="text-cyan-400">name</span>: nginx
            </div>
            <div>
              {' '}
              <span className="text-cyan-400">state</span>: present
            </div>
            <div></div>
            <div>
              - <span className="text-cyan-400">name</span>: Start nginx
            </div>
            <div>
              {' '}
              <span className="text-cyan-400">service</span>:
            </div>
            <div>
              {' '}
              <span className="text-cyan-400">name</span>: nginx
            </div>
            <div>
              {' '}
              <span className="text-cyan-400">state</span>: started
            </div>
          </div>
          <div className="mt-3 bg-amber-50 rounded-lg p-3 border border-amber-200">
            <span className="text-sm text-amber-700 font-medium">
              Tools: Ansible, Chef, Puppet, Shell scripts
            </span>
          </div>
        </ThemeCard>
      </div>

      {/* IaC Tool Comparison */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">IaC Tool Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-sky-200">
                <th className="text-left py-2 px-3 text-gray-900">Tool</th>
                <th className="text-left py-2 px-3 text-gray-900">Type</th>
                <th className="text-left py-2 px-3 text-gray-900">Language</th>
                <th className="text-left py-2 px-3 text-gray-900">Best For</th>
                <th className="text-left py-2 px-3 text-gray-900">Provider</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  tool: 'Terraform',
                  type: 'Declarative',
                  lang: 'HCL',
                  best: 'Multi-cloud infra',
                  provider: 'HashiCorp',
                },
                {
                  tool: 'Pulumi',
                  type: 'Declarative',
                  lang: 'TS/Python/Go',
                  best: 'Developer-friendly IaC',
                  provider: 'Pulumi',
                },
                {
                  tool: 'CloudFormation',
                  type: 'Declarative',
                  lang: 'YAML/JSON',
                  best: 'AWS-only infra',
                  provider: 'AWS',
                },
                {
                  tool: 'Ansible',
                  type: 'Imperative',
                  lang: 'YAML',
                  best: 'Config management',
                  provider: 'Red Hat',
                },
                {
                  tool: 'CDK',
                  type: 'Declarative',
                  lang: 'TS/Python/Java',
                  best: 'AWS with real code',
                  provider: 'AWS',
                },
                {
                  tool: 'Crossplane',
                  type: 'Declarative',
                  lang: 'YAML (K8s)',
                  best: 'K8s-native IaC',
                  provider: 'CNCF',
                },
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-200 even:bg-gray-50">
                  <td className="py-2 px-3 font-medium text-gray-900">{row.tool}</td>
                  <td className="py-2 px-3 text-gray-700">{row.type}</td>
                  <td className="py-2 px-3 text-gray-700">{row.lang}</td>
                  <td className="py-2 px-3 text-gray-700">{row.best}</td>
                  <td className="py-2 px-3 text-gray-700">{row.provider}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ThemeCard>

      {/* GitOps */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          GitOps — Git as the Source of Truth
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          GitOps is a practice where Git repositories are the single source of truth for both
          application code AND infrastructure. Changes to infrastructure happen through pull
          requests — the same workflow developers already know.
        </p>
        <div className="grid md:grid-cols-4 gap-3">
          {[
            { step: '1', title: 'Declare', desc: 'Define desired state in Git (YAML, HCL, etc.)' },
            { step: '2', title: 'Review', desc: 'Pull request, code review, approval' },
            { step: '3', title: 'Merge', desc: 'Merge to main branch triggers reconciliation' },
            { step: '4', title: 'Reconcile', desc: 'Operator ensures live state matches Git' },
          ].map((s, i) => (
            <div key={i} className="bg-sky-50 rounded-xl p-4 border border-sky-200 text-center">
              <div className="bg-sky-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                {s.step}
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">{s.title}</h4>
              <p className="text-xs text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-sky-50 rounded-lg p-3 border border-sky-200">
          <span className="text-sm text-sky-700 font-medium">
            Popular GitOps Tools: ArgoCD, Flux, Jenkins X
          </span>
        </div>
      </ThemeCard>

      {/* Configuration Drift */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-500" /> Configuration Drift
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          <strong>Drift</strong> occurs when live infrastructure diverges from the declared state —
          someone manually changed a security group, scaled an instance, or modified a config. IaC
          tools detect and fix drift automatically.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <h4 className="font-semibold text-red-800 mb-2">🔴 Drift Detected</h4>
            <p className="text-sm text-gray-700">Live state differs from declared state in code</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-2">🟡 Plan Generated</h4>
            <p className="text-sm text-gray-700">Tool shows what will change to fix drift</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h4 className="font-semibold text-emerald-800 mb-2">🟢 Drift Resolved</h4>
            <p className="text-sm text-gray-700">Apply plan to reconcile state, or update code</p>
          </div>
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
              Think of it like a recipe book 📖
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Without IaC, setting up servers is like cooking without a recipe — you remember some
              steps, forget others, and the result is different every time.{' '}
              <strong>Infrastructure as Code</strong> is writing down the exact recipe. Anyone can
              follow it and get the same result. If someone accidentally adds too much salt (changes
              a setting), you just re-read the recipe (run{' '}
              <code className="bg-amber-100 px-1 rounded text-sm">terraform apply</code>) and
              everything goes back to how it should be!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfrastructureAsCode;
