import React from 'react';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { Users, Lightbulb, Code, Server, GitBranch, Cloud, Shield, Zap } from 'lucide-react';

const ModernDevRoles: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-sky-50 via-white to-cyan-50 rounded-2xl p-8 border border-sky-100 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-sky-100 p-3 rounded-full">
            <Users className="w-8 h-8 text-sky-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modern DevOps Roles</h1>
            <p className="text-gray-600">How Cloud Computing Transformed Developer Roles</p>
          </div>
        </div>
        <p className="text-lg text-gray-700 leading-relaxed">
          Cloud computing and DevOps didn&apos;t just change technology — they transformed how
          development teams are structured. Gone are the rigid silos of &quot;developers write code,
          ops runs servers.&quot; Today, engineers wear multiple hats and embrace shared
          responsibility.
        </p>
      </div>

      {/* Role Cards */}
      <div className="space-y-6">
        {/* Frontend Cloud Developer */}
        <ThemeCard>
          <div className="flex items-start gap-4">
            <div className="bg-sky-100 p-3 rounded-full flex-shrink-0">
              <Code className="w-6 h-6 text-sky-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Frontend Cloud Developer</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Modern frontend developers do far more than write HTML/CSS/JS. They configure CDNs,
                set up edge functions, manage CI/CD pipelines for their SPAs, and optimize for
                global performance through edge computing.
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-sky-50 rounded-lg p-3 border border-sky-200">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Cloud Skills</h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Vercel / Netlify deployment</li>
                    <li>• CDN configuration (CloudFront)</li>
                    <li>• Edge functions / Workers</li>
                    <li>• JAMstack architecture</li>
                  </ul>
                </div>
                <div className="bg-sky-50 rounded-lg p-3 border border-sky-200">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">DevOps Skills</h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• GitHub Actions CI/CD</li>
                    <li>• Lighthouse CI for performance</li>
                    <li>• Feature flags (LaunchDarkly)</li>
                    <li>• Error monitoring (Sentry)</li>
                  </ul>
                </div>
                <div className="bg-sky-50 rounded-lg p-3 border border-sky-200">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Key Frameworks</h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Next.js, Nuxt, Remix</li>
                    <li>• React, Vue, Svelte</li>
                    <li>• Tailwind CSS, CSS-in-JS</li>
                    <li>• GraphQL, tRPC</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </ThemeCard>

        {/* Backend Serverless Developer */}
        <ThemeCard>
          <div className="flex items-start gap-4">
            <div className="bg-cyan-100 p-3 rounded-full flex-shrink-0">
              <Zap className="w-6 h-6 text-cyan-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Backend Serverless Developer
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Backend developers increasingly work in serverless environments — writing functions
                that respond to events instead of managing long-running servers. They think in terms
                of event-driven architectures and managed services.
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-cyan-50 rounded-lg p-3 border border-cyan-200">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Core Technologies</h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• AWS Lambda / Azure Functions</li>
                    <li>• API Gateway (REST/GraphQL)</li>
                    <li>• DynamoDB / Cosmos DB</li>
                    <li>• SQS / EventBridge / SNS</li>
                  </ul>
                </div>
                <div className="bg-cyan-50 rounded-lg p-3 border border-cyan-200">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">
                    Architecture Patterns
                  </h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Event-driven architecture</li>
                    <li>• CQRS &amp; Event Sourcing</li>
                    <li>• Saga pattern for transactions</li>
                    <li>• Fan-out / fan-in processing</li>
                  </ul>
                </div>
                <div className="bg-cyan-50 rounded-lg p-3 border border-cyan-200">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Observability</h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Distributed tracing (X-Ray)</li>
                    <li>• Structured logging</li>
                    <li>• Custom CloudWatch metrics</li>
                    <li>• Cold start optimization</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </ThemeCard>

        {/* DevOps / Platform Engineer */}
        <ThemeCard>
          <div className="flex items-start gap-4">
            <div className="bg-teal-100 p-3 rounded-full flex-shrink-0">
              <Server className="w-6 h-6 text-teal-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">DevOps / Platform Engineer</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Platform engineers build the &quot;golden paths&quot; — internal developer
                platforms, CI/CD pipelines, infrastructure templates, and self-service tools that
                make other developers 10x faster. They&apos;re the backbone of engineering
                organizations.
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Infrastructure</h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Terraform / Pulumi IaC</li>
                    <li>• Kubernetes administration</li>
                    <li>• Service mesh (Istio, Linkerd)</li>
                    <li>• Multi-cloud strategy</li>
                  </ul>
                </div>
                <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Platform Building</h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Internal Developer Portals</li>
                    <li>• Backstage / Port</li>
                    <li>• Self-service templates</li>
                    <li>• Golden paths for teams</li>
                  </ul>
                </div>
                <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Reliability</h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• SLOs / SLIs / Error budgets</li>
                    <li>• Incident management</li>
                    <li>• Chaos engineering</li>
                    <li>• On-call rotations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </ThemeCard>

        {/* SRE */}
        <ThemeCard>
          <div className="flex items-start gap-4">
            <div className="bg-violet-100 p-3 rounded-full flex-shrink-0">
              <Shield className="w-6 h-6 text-violet-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Site Reliability Engineer (SRE)
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                SREs treat operations as a software engineering problem. Originally coined by
                Google, SREs use error budgets to balance reliability with feature velocity — if
                your error budget is spent, you stop shipping and focus on reliability.
              </p>
              <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
                <h4 className="font-semibold text-violet-800 mb-2">The SRE Pillars:</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-sm text-gray-700 block">
                      <strong>SLOs</strong> — Service Level Objectives (target uptime)
                    </span>
                    <span className="text-sm text-gray-700 block">
                      <strong>SLIs</strong> — Service Level Indicators (measured metrics)
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700 block">
                      <strong>Error Budget</strong> — Allowed failure quota per period
                    </span>
                    <span className="text-sm text-gray-700 block">
                      <strong>Toil Reduction</strong> — Automate repetitive operational tasks
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ThemeCard>
      </div>

      {/* DevSecOps */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6 text-sky-600" /> DevSecOps — Security Everywhere
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          DevSecOps integrates security into every phase of the DevOps lifecycle — from coding to
          deployment. Security is no longer a gate at the end; it&apos;s baked into every step.
        </p>
        <div className="grid md:grid-cols-4 gap-3">
          {[
            {
              phase: 'Code',
              tools: 'SAST (Semgrep, SonarQube)',
              action: 'Static analysis on every PR',
            },
            {
              phase: 'Build',
              tools: 'SCA (Snyk, Dependabot)',
              action: 'Dependency vulnerability scanning',
            },
            {
              phase: 'Test',
              tools: 'DAST (OWASP ZAP)',
              action: 'Dynamic application security testing',
            },
            {
              phase: 'Deploy',
              tools: 'Image Scan (Trivy)',
              action: 'Container image vulnerability scan',
            },
          ].map((item, i) => (
            <div key={i} className="bg-sky-50 rounded-xl p-4 border border-sky-200">
              <h4 className="font-bold text-sky-800 mb-1">{item.phase}</h4>
              <p className="text-xs text-gray-600 mb-2">{item.tools}</p>
              <p className="text-xs text-gray-700 font-medium">{item.action}</p>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Career Path */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-sky-600" /> Career Path Progression
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Individual Contributor Track</h3>
            {[
              {
                level: 'Junior',
                title: 'Junior DevOps Engineer',
                desc: 'Learn CI/CD, basic IaC, monitoring',
              },
              {
                level: 'Mid',
                title: 'DevOps Engineer',
                desc: 'Own pipelines, K8s, infrastructure',
              },
              {
                level: 'Senior',
                title: 'Senior DevOps / SRE',
                desc: 'Architecture, reliability, mentoring',
              },
              {
                level: 'Staff',
                title: 'Staff Platform Engineer',
                desc: 'Org-wide platform strategy',
              },
              {
                level: 'Principal',
                title: 'Principal Engineer',
                desc: 'Industry thought leader, technical vision',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-sky-600 text-white text-xs font-bold px-2 py-1 rounded w-16 text-center flex-shrink-0">
                  {item.level}
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">{item.title}</span>
                  <span className="text-xs text-gray-600 block">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Certifications to Consider</h3>
            {[
              { cert: 'AWS Solutions Architect', provider: 'Amazon', level: '⭐⭐⭐' },
              { cert: 'CKA (Kubernetes Admin)', provider: 'CNCF', level: '⭐⭐⭐' },
              { cert: 'HashiCorp Terraform Assoc.', provider: 'HashiCorp', level: '⭐⭐' },
              { cert: 'Azure DevOps Engineer', provider: 'Microsoft', level: '⭐⭐⭐' },
              { cert: 'Google Cloud Professional', provider: 'Google', level: '⭐⭐⭐' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-gray-50 rounded-lg p-2 border border-gray-200"
              >
                <Cloud className="w-4 h-4 text-sky-500 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">{item.cert}</span>
                  <span className="text-xs text-gray-600 block">{item.provider}</span>
                </div>
                <span className="text-xs">{item.level}</span>
              </div>
            ))}
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
              Think of it like a school play 🎭
            </h3>
            <p className="text-gray-700 leading-relaxed">
              The <strong>Frontend Developer</strong> is the actor on stage — what the audience
              sees. The <strong>Backend Developer</strong> writes the script and manages the story
              behind the scenes. The <strong>DevOps Engineer</strong> is the stage manager — making
              sure lights work, curtains open on time, and the show goes on even if something
              breaks. The <strong>SRE</strong> is the safety inspector — making sure the stage
              won&apos;t collapse and the audience is safe!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDevRoles;
