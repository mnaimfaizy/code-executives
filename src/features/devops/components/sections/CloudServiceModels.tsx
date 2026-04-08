import React from 'react';
import ThemeCard from '../../../../components/shared/ThemeCard';
import CloudServiceModelsViz from '../visualizations/2d/CloudServiceModelsViz';
import { Cloud, Lightbulb, Server, TrendingUp } from 'lucide-react';

const CloudServiceModels: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-sky-50 via-white to-cyan-50 rounded-2xl p-8 border border-sky-100 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-sky-100 p-3 rounded-full">
            <Cloud className="w-8 h-8 text-sky-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cloud Service Models</h1>
            <p className="text-gray-600">IaaS, PaaS, SaaS, CaaS &amp; FaaS</p>
          </div>
        </div>
        <p className="text-lg text-gray-700 leading-relaxed">
          Cloud computing fundamentally changed how we think about infrastructure. Instead of buying
          and maintaining physical servers, you rent computing resources on-demand — paying only for
          what you use, like an electricity bill.
        </p>
      </div>

      {/* Interactive Visualization */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Interactive Comparison</h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Click each model to see what <strong>you manage</strong> vs. what the{' '}
          <strong>provider manages</strong>. Toggle the pizza analogy for a fun comparison!
        </p>
        <CloudServiceModelsViz />
      </ThemeCard>

      {/* Detailed Service Models */}
      <div className="grid md:grid-cols-2 gap-6">
        <ThemeCard>
          <div className="flex items-center gap-3 mb-4">
            <Server className="w-6 h-6 text-slate-600" />
            <h3 className="text-xl font-bold text-gray-900">IaaS — Infrastructure as a Service</h3>
          </div>
          <p className="text-gray-700 mb-4 leading-relaxed">
            You get raw computing resources — virtual machines, storage, networks — and build
            everything on top. Maximum control, maximum responsibility.
          </p>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h4 className="font-semibold text-slate-800 mb-2">Examples:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>
                • <strong>AWS EC2</strong> — Virtual machines
              </li>
              <li>
                • <strong>Azure VM</strong> — Microsoft&apos;s compute
              </li>
              <li>
                • <strong>Google Compute Engine</strong> — Google&apos;s VMs
              </li>
              <li>
                • <strong>DigitalOcean Droplets</strong> — Developer-friendly VMs
              </li>
            </ul>
          </div>
        </ThemeCard>

        <ThemeCard>
          <div className="flex items-center gap-3 mb-4">
            <Cloud className="w-6 h-6 text-sky-600" />
            <h3 className="text-xl font-bold text-gray-900">PaaS — Platform as a Service</h3>
          </div>
          <p className="text-gray-700 mb-4 leading-relaxed">
            The cloud provider manages the infrastructure — you just deploy your code. No more
            worrying about OS patches, load balancers, or scaling servers.
          </p>
          <div className="bg-sky-50 rounded-lg p-4 border border-sky-200">
            <h4 className="font-semibold text-sky-800 mb-2">Examples:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>
                • <strong>Heroku</strong> — Simple app deployment
              </li>
              <li>
                • <strong>Google App Engine</strong> — Google-managed platform
              </li>
              <li>
                • <strong>Azure App Service</strong> — Microsoft PaaS
              </li>
              <li>
                • <strong>Railway / Render</strong> — Modern PaaS alternatives
              </li>
            </ul>
          </div>
        </ThemeCard>

        <ThemeCard>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-violet-600" />
            <h3 className="text-xl font-bold text-gray-900">SaaS — Software as a Service</h3>
          </div>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Fully managed applications delivered over the internet. Users access everything through
            a browser — no installation, no maintenance.
          </p>
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <h4 className="font-semibold text-violet-800 mb-2">Examples:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>
                • <strong>Google Workspace</strong> — Docs, Sheets, Gmail
              </li>
              <li>
                • <strong>Salesforce</strong> — CRM platform
              </li>
              <li>
                • <strong>Slack / Teams</strong> — Communication
              </li>
              <li>
                • <strong>GitHub</strong> — Code hosting &amp; collaboration
              </li>
            </ul>
          </div>
        </ThemeCard>

        <ThemeCard>
          <div className="flex items-center gap-3 mb-4">
            <Cloud className="w-6 h-6 text-emerald-600" />
            <h3 className="text-xl font-bold text-gray-900">FaaS — Functions as a Service</h3>
          </div>
          <p className="text-gray-700 mb-4 leading-relaxed">
            The purest form of serverless. You write individual functions that execute in response
            to events. Zero infrastructure to manage — scales to zero when idle.
          </p>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h4 className="font-semibold text-emerald-800 mb-2">Examples:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>
                • <strong>AWS Lambda</strong> — Amazon&apos;s serverless compute
              </li>
              <li>
                • <strong>Azure Functions</strong> — Microsoft serverless
              </li>
              <li>
                • <strong>Google Cloud Functions</strong> — Google serverless
              </li>
              <li>
                • <strong>Cloudflare Workers</strong> — Edge functions
              </li>
            </ul>
          </div>
        </ThemeCard>
      </div>

      {/* NIST Definition */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          NIST&apos;s 5 Essential Characteristics
        </h2>
        <p className="text-gray-600 mb-4 text-sm">
          The National Institute of Standards and Technology defines cloud computing with 5
          essential traits:
        </p>
        <div className="grid md:grid-cols-5 gap-3">
          {[
            {
              title: 'On-Demand Self-Service',
              desc: 'Provision resources without human intervention',
            },
            { title: 'Broad Network Access', desc: 'Access from any device over the network' },
            { title: 'Resource Pooling', desc: 'Multi-tenant model for shared resources' },
            { title: 'Rapid Elasticity', desc: 'Scale up/down instantly to match demand' },
            { title: 'Measured Service', desc: 'Pay only for what you consume' },
          ].map((char, i) => (
            <div key={i} className="bg-sky-50 rounded-lg p-3 border border-sky-200 text-center">
              <div className="bg-sky-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                {i + 1}
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">{char.title}</h4>
              <p className="text-xs text-gray-600">{char.desc}</p>
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
            <h3 className="text-lg font-bold text-amber-900 mb-2">The Pizza Analogy 🍕</h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>On-Premises</strong> = Making pizza at home (you do everything).{' '}
              <strong>IaaS</strong> = Renting a kitchen (you bring ingredients &amp; cook).{' '}
              <strong>PaaS</strong> = Take-and-bake pizza (oven &amp; dough provided, you add
              toppings). <strong>SaaS</strong> = Pizza delivery (just eat!). <strong>FaaS</strong> =
              Pizza by the slice (pay per bite, no waste).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudServiceModels;
