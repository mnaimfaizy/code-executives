import React from 'react';
import ThemeCard from '../../../../components/shared/ThemeCard';
import CICDPipelineViz from '../visualizations/2d/CICDPipelineViz';
import { GitBranch, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';

const CICDPipeline: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-sky-50 via-white to-cyan-50 rounded-2xl p-8 border border-sky-100 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-sky-100 p-3 rounded-full">
            <GitBranch className="w-8 h-8 text-sky-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CI/CD Pipeline</h1>
            <p className="text-gray-600">Continuous Integration &amp; Continuous Delivery</p>
          </div>
        </div>
        <p className="text-lg text-gray-700 leading-relaxed">
          A CI/CD pipeline automates the journey from code commit to production deployment. Every
          code change is automatically built, tested, scanned for security vulnerabilities, and
          deployed — reducing human error and enabling teams to deploy hundreds of times per day.
        </p>
      </div>

      {/* Interactive Pipeline Visualization */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Interactive Pipeline</h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Watch a complete CI/CD pipeline execute. Each stage runs automatically, and the pipeline
          halts if any stage fails — this is the &quot;fail fast&quot; principle.
        </p>
        <CICDPipelineViz />
      </ThemeCard>

      {/* CI vs CD explanation */}
      <div className="grid md:grid-cols-2 gap-6">
        <ThemeCard>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-sky-600" /> Continuous Integration (CI)
          </h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Developers merge their code changes into a shared repository multiple times a day. Each
            merge triggers an automated build and test suite.
          </p>
          <div className="bg-sky-50 rounded-lg p-4 border border-sky-200">
            <h4 className="font-semibold text-sky-800 mb-2">CI Best Practices:</h4>
            <ul className="space-y-1.5 text-sm text-gray-700">
              <li>• Commit to mainline at least once a day</li>
              <li>• Every commit triggers automated tests</li>
              <li>• Fix broken builds immediately (priority #1)</li>
              <li>• Keep the build fast (&lt; 10 minutes)</li>
            </ul>
          </div>
        </ThemeCard>

        <ThemeCard>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" /> Continuous Delivery (CD)
          </h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Every change that passes the automated pipeline is <strong>ready to deploy</strong> to
            production. Continuous Deployment goes further — deploying automatically without human
            approval.
          </p>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h4 className="font-semibold text-emerald-800 mb-2">Deployment Strategies:</h4>
            <ul className="space-y-1.5 text-sm text-gray-700">
              <li>
                • <strong>Blue-Green:</strong> Two identical environments, swap traffic
              </li>
              <li>
                • <strong>Canary:</strong> Roll out to 5% of users first
              </li>
              <li>
                • <strong>Rolling:</strong> Gradually replace old instances
              </li>
              <li>
                • <strong>Feature Flags:</strong> Toggle features without deploy
              </li>
            </ul>
          </div>
        </ThemeCard>
      </div>

      {/* Popular CI/CD Tools */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Popular CI/CD Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'GitHub Actions', icon: '🐙', desc: 'Native GitHub CI/CD' },
            { name: 'Jenkins', icon: '🔧', desc: 'Open-source automation' },
            { name: 'GitLab CI', icon: '🦊', desc: 'All-in-one DevOps' },
            { name: 'CircleCI', icon: '⭕', desc: 'Cloud-native CI/CD' },
            { name: 'ArgoCD', icon: '🚢', desc: 'GitOps for Kubernetes' },
            { name: 'Spinnaker', icon: '🎡', desc: 'Multi-cloud deploy' },
            { name: 'Travis CI', icon: '🏠', desc: 'Open-source CI' },
            { name: 'AWS CodePipeline', icon: '☁️', desc: 'AWS native pipeline' },
          ].map((tool, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200 hover:shadow-md transition-shadow"
            >
              <span className="text-2xl">{tool.icon}</span>
              <h4 className="font-semibold text-gray-900 mt-2 text-sm">{tool.name}</h4>
              <p className="text-xs text-gray-600 mt-1">{tool.desc}</p>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Anti-patterns */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-500" /> Common CI/CD Anti-Patterns
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              bad: 'Long-lived feature branches (weeks/months)',
              fix: 'Merge to main daily, use feature flags',
            },
            {
              bad: 'Skipping tests to "ship faster"',
              fix: 'Tests ARE the safety net — never skip',
            },
            { bad: 'Manual deployment steps', fix: 'Automate everything, including rollbacks' },
            { bad: 'No security scanning', fix: 'Add SAST/DAST/dependency scanning to pipeline' },
          ].map((item, i) => (
            <div key={i} className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-red-500 font-bold">✗</span>
                <span className="text-sm text-gray-700">{item.bad}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span className="text-sm text-gray-700 font-medium">{item.fix}</span>
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
              Think of it like a factory assembly line 🏭
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Imagine a toy factory. When you design a new toy, it goes through stations — each
              station checks something: &quot;Is the paint right? Are the wheels on? Is it
              safe?&quot; Only if the toy passes ALL stations does it go into a box and ship to
              stores. That&apos;s exactly what a CI/CD pipeline does for code — each stage verifies
              quality automatically!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CICDPipeline;
