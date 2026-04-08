import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import StatsGrid from '../../../../components/shared/StatsGrid';
import {
  Cloud,
  GitBranch,
  Container,
  Shield,
  Zap,
  Server,
  Lightbulb,
  RefreshCw,
  Layers,
  Eye,
  Settings,
  Users,
} from 'lucide-react';
import DevOpsInfiniteLoop from '../visualizations/2d/DevOpsInfiniteLoop';

const Introduction: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    const baseUrl = '/devops?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  const stats = [
    {
      value: '7',
      label: 'Interactive Sections',
      icon: <Layers className="w-5 h-5" />,
    },
    {
      value: '6+',
      label: 'Visualizations',
      icon: <Eye className="w-5 h-5" />,
    },
    {
      value: '99.5%',
      label: 'Deploy Success (Netflix)',
      icon: <Zap className="w-5 h-5" />,
    },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-sky-100 p-4 rounded-full">
          <Cloud className="w-16 h-16 text-sky-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        DevOps &amp; Cloud Computing: From Culture to Infrastructure
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        How did software delivery evolve from months-long release cycles to hundreds of daily
        deployments? This module explores the DevOps revolution, cloud computing architectures,
        CI/CD pipelines, and modern infrastructure — all through interactive visualizations.
      </p>
      <StatsGrid stats={stats} colorScheme="sky" />
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-sky-100 text-sky-800 px-4 py-2 rounded-full text-sm font-semibold">
          ♾️ DevOps Lifecycle
        </span>
        <span className="bg-cyan-100 text-cyan-800 px-4 py-2 rounded-full text-sm font-semibold">
          ☁️ Cloud Models
        </span>
        <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-semibold">
          🐳 Containers
        </span>
        <span className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔄 CI/CD Pipelines
        </span>
      </div>
    </div>
  );

  const mainContent = (
    <>
      {/* ELI10 Explanation */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200 mb-8">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">Explain Like I&apos;m 10 🧒</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Imagine a group of kids building the ultimate sandcastle on a busy beach. Some kids
              are <strong>Builders</strong> who create the tallest towers. Other kids are{' '}
              <strong>Guardians</strong> trying to protect the castle from ocean waves. Often they
              get in each other&apos;s way!
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>DevOps is like an older sibling</strong> who organizes everything. They
              prepare the perfect wet sand, hand out the best buckets (tools), draw a safe boundary
              line on the beach, and if a tower falls, they have a photograph of exactly what it
              looked like five minutes ago, so it can be rebuilt instantly.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>The Cloud?</strong> It&apos;s like a magical toy box in the sky. It never gets
              full, and you can take out or put in toys anytime, anywhere. When you play Minecraft,
              your progress isn&apos;t saved on your tablet — it&apos;s saved in this magic box. You
              can log in on a completely different computer and continue right where you left off!
            </p>
          </div>
        </div>
      </div>

      {/* Interactive DevOps Infinite Loop */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">The DevOps Infinite Loop</h2>
        <p className="text-gray-700 leading-relaxed mb-6">
          DevOps is not a tool or a job title — it&apos;s a <strong>cultural movement</strong> that
          emerged between 2007-2009 to fix the &quot;Wall of Confusion&quot; between developers and
          operations teams. The infinite loop below represents the continuous cycle of planning,
          building, deploying, and monitoring software.
        </p>
        <DevOpsInfiniteLoop />
      </ThemeCard>

      {/* History Timeline */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">The Genesis of DevOps</h2>
        <div className="space-y-4">
          {[
            {
              year: '2007-2008',
              event: 'The Dysfunction Identified',
              desc: 'IT community recognized fatal dysfunction between Dev and Ops teams with separate leadership, competing KPIs, and botched releases.',
            },
            {
              year: 'June 2009',
              event: 'The Velocity Conference Breakthrough',
              desc: 'John Allspaw and Paul Hammond presented "10+ Deploys a Day: Dev and Ops Cooperation at Flickr" — proving seamless integration was possible.',
            },
            {
              year: 'Oct 2009',
              event: 'DevOpsDays is Born',
              desc: 'Patrick Debois organized the first DevOpsDays in Belgium. Twitter hashtag #DevOps was coined and spread globally.',
            },
            {
              year: 'March 2011',
              event: 'Enterprise Recognition',
              desc: 'Gartner analyst Cameron Haight recognized DevOps as the next major evolution in IT, following Agile methodologies.',
            },
            {
              year: 'Today',
              event: '99% Confidence Rate',
              desc: 'Surveys show 99% of DevOps teams feel highly confident in their production deployments. Netflix achieves 245 daily deployments.',
            },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-20 text-right">
                <span className="text-sm font-bold text-sky-600">{item.year}</span>
              </div>
              <div className="flex-shrink-0 w-3 h-3 rounded-full bg-sky-500 mt-1.5 border-4 border-sky-100" />
              <div className="flex-1 pb-4 border-b border-gray-100 last:border-0">
                <h4 className="font-semibold text-gray-900">{item.event}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Key Problems Solved */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">What Problems Does DevOps Solve?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: <RefreshCw className="w-6 h-6 text-sky-600" />,
              title: 'Slow Release Cycles',
              before: 'Monthly or quarterly releases with high failure rates',
              after: 'Continuous delivery with automated pipelines — deploy daily or hourly',
            },
            {
              icon: <Shield className="w-6 h-6 text-emerald-600" />,
              title: 'Environment Mismatches',
              before: '"Works on my machine" — dev and prod environments were different',
              after: 'Infrastructure as Code ensures identical environments everywhere',
            },
            {
              icon: <Zap className="w-6 h-6 text-amber-600" />,
              title: 'Slow Recovery (MTTR)',
              before: 'Manual root cause analysis took hours or days',
              after: 'Automated rollbacks and observability tools recover in minutes',
            },
            {
              icon: <Users className="w-6 h-6 text-purple-600" />,
              title: 'Siloed Teams',
              before: 'Dev, Ops, QA, and Security worked in isolation',
              after: 'Cross-functional collaboration with shared accountability',
            },
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white rounded-lg p-2 shadow-sm">{item.icon}</div>
                <h3 className="font-bold text-gray-900">{item.title}</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-0.5">✗</span>
                  <span className="text-gray-600">{item.before}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                  <span className="text-gray-700">{item.after}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Cloud Computing Origins */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">The Rise of Cloud Computing</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              From Mainframes to the Cloud
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Historically, organizations purchased massive, expensive mainframe computers that
              required specialized climate-controlled rooms. Procurement took months, and businesses
              had to guess their capacity needs — over-purchasing meant wasted millions;
              under-purchasing meant crashes during traffic spikes.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Cloud computing solved this by transforming <strong>capital expenditures</strong>{' '}
              (buying hardware) into <strong>operational expenses</strong> (renting compute power as
              a utility). Organizations now scale automatically and pay only for what they use.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Cloud History Milestones</h3>
            <div className="space-y-3">
              {[
                { era: '1950s-60s', label: 'Time-sharing on mainframes' },
                { era: '1970s-80s', label: 'Virtual machines & VPNs emerge' },
                { era: 'Early 2000s', label: 'Amazon & Google offer public cloud' },
                { era: '2005-2011', label: 'SLAs, OpenStack, first-gen cloud' },
                { era: '2012+', label: 'Containers, streaming, serverless' },
              ].map((m, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 text-xs font-bold text-sky-600 w-20 text-right mt-0.5">
                    {m.era}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Netflix case study */}
        <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-6 border border-red-200">
          <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center gap-2">
            🎬 Case Study: Netflix
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-3">
              <div className="text-2xl font-bold text-red-600">245</div>
              <div className="text-xs text-gray-600">Daily Deployments</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-2xl font-bold text-red-600">99.5%</div>
              <div className="text-xs text-gray-600">Deploy Success Rate</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-2xl font-bold text-red-600">71%</div>
              <div className="text-xs text-gray-600">Fewer Incidents</div>
            </div>
          </div>
          <p className="text-sm text-gray-700 mt-3 leading-relaxed">
            Netflix uses Chaos Monkey (intentionally injecting failures) and Spinnaker (automated
            deployments) to achieve industry-leading deployment reliability.
          </p>
        </div>
      </ThemeCard>
    </>
  );

  const sidebar = (
    <div className="space-y-4">
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-sky-600" />
          Explore Sections
        </h3>
        <div className="space-y-2">
          <NavigationCard
            title="CI/CD Pipeline"
            description="Automated build, test, and deploy workflows"
            colorScheme="sky"
            icon={<GitBranch className="w-4 h-4 text-sky-600" />}
            onClick={() => navigateToSection('CI/CD Pipeline')}
          />
          <NavigationCard
            title="Cloud Service Models"
            description="IaaS, PaaS, SaaS — the pizza analogy"
            colorScheme="sky"
            icon={<Cloud className="w-4 h-4 text-sky-600" />}
            onClick={() => navigateToSection('Cloud Service Models')}
          />
          <NavigationCard
            title="Cloud Architecture"
            description="Microservices, serverless, and load balancing"
            colorScheme="sky"
            icon={<Layers className="w-4 h-4 text-sky-600" />}
            onClick={() => navigateToSection('Cloud Architecture')}
          />
          <NavigationCard
            title="Container Orchestration"
            description="Docker and Kubernetes interactive demo"
            colorScheme="sky"
            icon={<Container className="w-4 h-4 text-sky-600" />}
            onClick={() => navigateToSection('Container Orchestration')}
          />
          <NavigationCard
            title="Infrastructure as Code"
            description="Terraform, Ansible, and Dockerfiles"
            colorScheme="sky"
            icon={<Server className="w-4 h-4 text-sky-600" />}
            onClick={() => navigateToSection('Infrastructure as Code')}
          />
          <NavigationCard
            title="Modern Dev Roles"
            description="Frontend Cloud, Backend Serverless, DevOps Engineer"
            colorScheme="sky"
            icon={<Users className="w-4 h-4 text-sky-600" />}
            onClick={() => navigateToSection('Modern Dev Roles')}
          />
          <NavigationCard
            title="Observability"
            description="Monitoring, logging, and alerting"
            colorScheme="sky"
            icon={<Eye className="w-4 h-4 text-sky-600" />}
            onClick={() => navigateToSection('Observability')}
          />
        </div>
      </ThemeCard>

      {/* Key Stats */}
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          📊 Industry Impact
        </h3>
        <div className="space-y-3">
          <div className="bg-sky-50 rounded-lg p-3 border border-sky-200">
            <div className="text-xl font-bold text-sky-700">300%</div>
            <div className="text-xs text-gray-600">
              Increase in deployment frequency with DevOps
            </div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
            <div className="text-xl font-bold text-emerald-700">80%</div>
            <div className="text-xs text-gray-600">Reduction in change lead time</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <div className="text-xl font-bold text-purple-700">99%</div>
            <div className="text-xs text-gray-600">Teams confidence in production deploys</div>
          </div>
        </div>
      </ThemeCard>
    </div>
  );

  return (
    <>
      <SectionLayout
        section="devops"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebar}
      />
      <CTASection
        title="Start Your DevOps Journey"
        description="Begin with the CI/CD Pipeline to understand how modern software is built, tested, and deployed automatically."
        buttonText="Explore CI/CD Pipeline"
        onButtonClick={() => navigateToSection('CI/CD Pipeline')}
        colorScheme="sky"
      />
    </>
  );
};

export default Introduction;
