import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { Globe, Shield, Key, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';

const OAuthOIDC: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    window.location.href = '/auth?section=' + encodeURIComponent(sectionName);
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-amber-100 p-4 rounded-full">
          <Globe className="w-16 h-16 text-amber-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">OAuth 2.0 & OpenID Connect</h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        The industry-standard protocols for delegated authorization and federated identity —
        understand how they work together, and why using OAuth alone for login is dangerous.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Protocol Overview */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">The Federated Identity Stack</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center space-x-3 mb-3">
              <Key className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-bold text-blue-900">OAuth 2.0</h3>
            </div>
            <p className="text-sm font-semibold text-blue-700 mb-2">Authorization Protocol</p>
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              OAuth 2.0 (RFC 6749, 2012) is an <strong>authorization framework</strong> that allows
              applications to obtain limited access to user accounts on third-party services. It
              issues <strong>Access Tokens</strong> that dictate which resources an app can access.
            </p>
            <div className="flex items-start space-x-2 bg-amber-50 rounded-lg p-3 border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                <strong>OAuth 2.0 is NOT an authentication protocol.</strong> The access token
                contains no verifiable user identity. Using it for login (pseudo-authentication) is
                dangerous.
              </p>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="w-8 h-8 text-amber-600" />
              <h3 className="text-xl font-bold text-amber-900">OpenID Connect (OIDC)</h3>
            </div>
            <p className="text-sm font-semibold text-amber-700 mb-2">Authentication Layer</p>
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              OIDC (2014) is an <strong>authentication layer built on top of OAuth 2.0</strong>. It
              mandates the issuance of an <strong>ID Token</strong> — a signed JWT containing
              verifiable claims about the user (subject ID, email, auth time).
            </p>
            <div className="flex items-start space-x-2 bg-green-50 rounded-lg p-3 border border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-green-800">
                <strong>OIDC solves the authentication gap in OAuth 2.0</strong> by adding
                verifiable identity with JWT, standard /userinfo endpoint, and dynamic key
                management.
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Protocol Comparison Table */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Protocol Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-amber-50">
                <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-amber-200">
                  Protocol
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-amber-200">
                  Function
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-amber-200">
                  Format
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b border-amber-200">
                  Ideal Use Case
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  'SAML 2.0',
                  'Authentication & Authorization',
                  'XML / SOAP',
                  'Legacy Enterprise Web SSO',
                ],
                [
                  'OAuth 2.0',
                  'Authorization (Delegated Access)',
                  'JSON / HTTP',
                  'Securing third-party API access',
                ],
                [
                  'OpenID Connect',
                  'Authentication (Identity)',
                  'JSON (JWT) / HTTP',
                  'Modern Web, SPA, Mobile logins',
                ],
                [
                  'OpenConnect',
                  'Network Tunneling (VPN)',
                  'TLS / DTLS / ESP',
                  'Corporate VPN connections',
                ],
              ].map(([protocol, func, format, useCase], i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-gray-900 border-b border-gray-100">
                    {protocol}
                  </td>
                  <td className="px-4 py-3 text-gray-700 border-b border-gray-100">{func}</td>
                  <td className="px-4 py-3 text-gray-700 border-b border-gray-100">{format}</td>
                  <td className="px-4 py-3 text-gray-700 border-b border-gray-100">{useCase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ThemeCard>

      {/* OAuth Evolution */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">From OAuth 1.0 to OIDC</h2>
        <div className="space-y-4">
          {[
            {
              year: '2007',
              title: 'OAuth 1.0',
              desc: 'Introduced delegated access with complex cryptographic signatures. Effective but extremely challenging for developers to implement.',
              color: 'bg-gray-100 border-gray-300',
            },
            {
              year: '2012',
              title: 'OAuth 2.0 (RFC 6749)',
              desc: 'Complete rewrite — replaced complex signatures with Bearer Tokens over HTTPS. Introduced flexible Grant Types for different client architectures.',
              color: 'bg-blue-50 border-blue-300',
            },
            {
              year: '2014',
              title: 'OpenID Connect',
              desc: 'Added authentication on top of OAuth 2.0 — mandated ID Tokens (JWT), /userinfo endpoint, and dynamic key management.',
              color: 'bg-amber-50 border-amber-300',
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`${item.color} border rounded-xl p-5 flex items-start space-x-4`}
            >
              <div className="text-lg font-bold text-gray-900 bg-white rounded-lg px-3 py-1 shadow-sm flex-shrink-0">
                {item.year}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-700 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Key Tokens */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Token Types in OIDC</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              token: 'ID Token',
              purpose: 'Authentication — "Who is this user?"',
              format: 'JWT (signed, verifiable)',
              contains: 'Subject ID, email, auth time, issuer',
              color: 'amber',
            },
            {
              token: 'Access Token',
              purpose: 'Authorization — "What can they access?"',
              format: 'Opaque or JWT',
              contains: 'Scopes, audience, expiration',
              color: 'blue',
            },
            {
              token: 'Refresh Token',
              purpose: 'Session continuity',
              format: 'Opaque',
              contains: 'Long-lived credential to obtain new access tokens',
              color: 'green',
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`bg-${item.color}-50 rounded-xl p-5 border border-${item.color}-200`}
            >
              <h3 className={`text-lg font-bold text-${item.color}-900 mb-2`}>{item.token}</h3>
              <p className="text-sm text-gray-700 mb-3">{item.purpose}</p>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-gray-800">Format: </span>
                  <span className="text-gray-600">{item.format}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Contains: </span>
                  <span className="text-gray-600">{item.contains}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigateToSection('PKCE Authorization Flow')}
          className="mt-6 inline-flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
        >
          <span>Next: Interactive PKCE Flow</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </ThemeCard>
    </>
  );

  return <SectionLayout section="auth" hero={heroContent} mainContent={mainContent} />;
};

export default OAuthOIDC;
