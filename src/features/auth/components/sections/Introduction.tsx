import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import StatsGrid from '../../../../components/shared/StatsGrid';
import { Shield, Lock, Key, Fingerprint, Users, AlertTriangle } from 'lucide-react';

const Introduction: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    const baseUrl = '/auth?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  const stats = [
    {
      value: '80%+',
      label: 'Breaches from Credential Attacks',
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
      value: '$4.45M',
      label: 'Average Data Breach Cost',
      icon: <Shield className="w-5 h-5" />,
    },
    {
      value: '100+',
      label: 'Accounts per Average User',
      icon: <Users className="w-5 h-5" />,
    },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-amber-100 p-4 rounded-full">
          <Shield className="w-16 h-16 text-amber-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Modern Authentication & Authorization
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Master the protocols and patterns that secure every modern web and mobile application. From
        OAuth 2.0 and OpenID Connect to WebAuthn Passkeys and Zero Trust Architecture — understand
        how identity really works in production systems.
      </p>
      <StatsGrid stats={stats} colorScheme="amber" />
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔐 OAuth 2.0 & OIDC
        </span>
        <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold">
          🛡️ Zero Trust
        </span>
        <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔑 Passkeys & WebAuthn
        </span>
        <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold">
          🤖 AI Agent Auth
        </span>
      </div>
    </div>
  );

  const mainContent = (
    <>
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Why Authentication & Authorization Matter
        </h2>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              <Lock className="w-5 h-5 inline mr-2 text-amber-600" />
              Authentication: "Who Are You?"
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Authentication is the process of <strong>verifying the identity</strong> of a user,
              device, or system. It answers the fundamental question:{' '}
              <em>"Are you really who you claim to be?"</em> Modern authentication has evolved from
              simple passwords to cryptographic proofs that are mathematically impossible to forge.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The evolution spans from shared secrets in the 1960s to today's passwordless
              WebAuthn/Passkey standards — where no secret ever crosses the network.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              <Key className="w-5 h-5 inline mr-2 text-orange-600" />
              Authorization: "What Can You Do?"
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Authorization determines{' '}
              <strong>what actions a verified identity is permitted to perform</strong>. Even with
              perfect authentication, broken authorization leads to privilege escalation — where a
              regular user accesses admin controls or another tenant's data.
            </p>
            <p className="text-gray-700 leading-relaxed">
              From static Access Control Lists to dynamic Zero Trust evaluations, authorization has
              become a continuous, context-aware process evaluated at every interaction.
            </p>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">The Modern Identity Landscape</h2>
        <div className="space-y-4">
          {[
            {
              icon: <Fingerprint className="w-6 h-6 text-amber-600" />,
              title: 'Passwordless Authentication',
              desc: 'WebAuthn & Passkeys use public-key cryptography — no shared secret ever leaves your device.',
            },
            {
              icon: <Shield className="w-6 h-6 text-orange-600" />,
              title: 'OAuth 2.0 & OpenID Connect',
              desc: 'The industry-standard protocols for delegated authorization and federated identity verification.',
            },
            {
              icon: <Lock className="w-6 h-6 text-red-600" />,
              title: 'Zero Trust Architecture',
              desc: 'Never trust, always verify — continuous authentication and authorization at every boundary.',
            },
            {
              icon: <Users className="w-6 h-6 text-yellow-600" />,
              title: 'AI Agent Identity',
              desc: 'Autonomous agents require scoped, least-privilege tokens via Token Exchange (RFC 8693).',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-amber-200 transition-colors"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                {item.icon}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>

      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication vs Authorization</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-amber-50">
                <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-amber-200">
                  Aspect
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-amber-200">
                  Authentication
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-amber-200">
                  Authorization
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Question', '"Who are you?"', '"What can you do?"'],
                ['Purpose', 'Verify identity', 'Enforce permissions'],
                ['When', 'Before authorization', 'After authentication'],
                ['Token', 'ID Token (JWT)', 'Access Token'],
                ['Protocol', 'OpenID Connect', 'OAuth 2.0'],
                ['Failure', 'HTTP 401 Unauthorized', 'HTTP 403 Forbidden'],
              ].map(([aspect, authn, authz], i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-gray-900 border-b border-gray-100">
                    {aspect}
                  </td>
                  <td className="px-4 py-3 text-gray-700 border-b border-gray-100">{authn}</td>
                  <td className="px-4 py-3 text-gray-700 border-b border-gray-100">{authz}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ThemeCard>

      <CTASection
        title="Dive Into the Protocols"
        description="Explore interactive visualizations of OAuth 2.0 flows, PKCE handshakes, and Zero Trust architectures."
        buttonText="Start with OAuth & OIDC"
        colorScheme="amber"
        onButtonClick={() => navigateToSection('OAuth 2.0 & OpenID Connect')}
      />
    </>
  );

  const sidebar = (
    <div className="space-y-4">
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">📚 Module Sections</h3>
        <div className="space-y-2">
          <NavigationCard
            title="Evolution of Identity"
            description="From passwords to passkeys — 60 years of evolution"
            colorScheme="amber"
            onClick={() => navigateToSection('Evolution of Digital Identity')}
          />
          <NavigationCard
            title="Authentication Types"
            description="MFA, WebAuthn, Passkeys & passwordless"
            colorScheme="amber"
            onClick={() => navigateToSection('Authentication Types')}
          />
          <NavigationCard
            title="Authorization Models"
            description="RBAC, ABAC, ReBAC & Zero Trust"
            colorScheme="orange"
            onClick={() => navigateToSection('Authorization Models')}
          />
          <NavigationCard
            title="OAuth 2.0 & OIDC"
            description="Federation protocols & token mechanics"
            colorScheme="amber"
            onClick={() => navigateToSection('OAuth 2.0 & OpenID Connect')}
          />
          <NavigationCard
            title="PKCE Flow"
            description="Interactive PKCE Authorization Code walkthrough"
            colorScheme="orange"
            onClick={() => navigateToSection('PKCE Authorization Flow')}
          />
          <NavigationCard
            title="BFF Pattern"
            description="Backend for Frontend token security"
            colorScheme="amber"
            onClick={() => navigateToSection('BFF Pattern')}
          />
          <NavigationCard
            title="AI Agent Auth"
            description="Token Exchange for autonomous agents"
            colorScheme="orange"
            onClick={() => navigateToSection('AI Agent Authentication')}
          />
          <NavigationCard
            title="All Visualizations"
            description="Interactive diagrams & flow animations"
            colorScheme="amber"
            onClick={() => navigateToSection('Visualization')}
          />
        </div>
      </ThemeCard>
    </div>
  );

  return (
    <SectionLayout section="auth" hero={heroContent} mainContent={mainContent} sidebar={sidebar} />
  );
};

export default Introduction;
