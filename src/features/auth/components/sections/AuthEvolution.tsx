import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { Clock, Shield, Key, Fingerprint, Smartphone, ArrowRight } from 'lucide-react';

const AuthEvolution: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    window.location.href = '/auth?section=' + encodeURIComponent(sectionName);
  };

  const timeline = [
    {
      era: '1960s–1970s',
      authn: 'Simple Passwords & Shared Secrets',
      authz: 'Access Control Lists (ACLs)',
      shift: 'Transition to time-sharing mainframes',
      color: 'bg-gray-100 border-gray-300',
      dot: 'bg-gray-400',
    },
    {
      era: '1980s',
      authn: 'Dynamic Passwords & Early Tokens',
      authz: 'Role-Based Access Control (RBAC)',
      shift: 'Formal separation of identity and permissions (Bell-LaPadula)',
      color: 'bg-blue-50 border-blue-300',
      dot: 'bg-blue-500',
    },
    {
      era: '1990s',
      authn: 'Public Key Infrastructure (PKI)',
      authz: 'Attribute-Based Access Control (ABAC)',
      shift: 'Expansion of networked computing and dynamic policy engines',
      color: 'bg-indigo-50 border-indigo-300',
      dot: 'bg-indigo-500',
    },
    {
      era: '2000s',
      authn: 'Emergence of MFA and SSO',
      authz: 'Policy-Based Access Control (PBAC)',
      shift: 'Centralized identity providers managing multiple applications',
      color: 'bg-purple-50 border-purple-300',
      dot: 'bg-purple-500',
    },
    {
      era: '2010s',
      authn: 'Biometrics & Adaptive Risk-Based Auth',
      authz: 'Dynamic & Context-Aware Systems',
      shift: 'Mobile-first computing and API-driven architectures',
      color: 'bg-amber-50 border-amber-300',
      dot: 'bg-amber-500',
    },
    {
      era: '2020s',
      authn: 'Passwordless (WebAuthn/Passkeys)',
      authz: 'Zero Trust & Continuous Auth',
      shift: 'Elimination of trusted networks; cryptographic keys replace passwords',
      color: 'bg-orange-50 border-orange-300',
      dot: 'bg-orange-600',
    },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-amber-100 p-4 rounded-full">
          <Clock className="w-16 h-16 text-amber-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">The Evolution of Digital Identity</h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        From mainframe passwords in the 1960s to cryptographic passkeys today — trace six decades of
        authentication and authorization evolution.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Interactive Timeline */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Identity Through the Decades</h2>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 via-amber-400 to-orange-500" />

          <div className="space-y-8">
            {timeline.map((item, i) => (
              <div key={i} className="relative pl-16">
                {/* Dot */}
                <div
                  className={`absolute left-4 top-2 w-5 h-5 rounded-full ${item.dot} ring-4 ring-white shadow-md`}
                />

                <div
                  className={`${item.color} border rounded-xl p-6 transition-all hover:shadow-md`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl font-bold text-gray-900">{item.era}</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                        Authentication
                      </div>
                      <p className="text-gray-800 font-medium">{item.authn}</p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">
                        Authorization
                      </div>
                      <p className="text-gray-800 font-medium">{item.authz}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 italic">{item.shift}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Inflection Points</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: <Key className="w-8 h-8 text-blue-600" />,
              title: 'Asymmetric Cryptography (1970s)',
              desc: 'Diffie–Hellman and RSA allowed two parties to communicate securely without pre-sharing a secret — the mathematical foundation for everything that followed.',
            },
            {
              icon: <Shield className="w-8 h-8 text-purple-600" />,
              title: 'OAuth 2.0 & OIDC (2012–2014)',
              desc: 'Separated authorization from authentication. OAuth 2.0 handles delegated access; OpenID Connect adds verifiable identity on top.',
            },
            {
              icon: <Fingerprint className="w-8 h-8 text-amber-600" />,
              title: 'FIDO2 & Passkeys (2020s)',
              desc: 'Eliminated shared secrets entirely. Public-key credentials bound to device hardware, unlocked via biometrics — truly unphishable.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <div className="mb-3">{item.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </ThemeCard>

      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">The Modern Challenge</h2>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
          <div className="flex items-start space-x-4">
            <Smartphone className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-gray-800 leading-relaxed mb-3">
                Today's applications are no longer monolithic structures behind a corporate
                firewall. They are <strong>distributed, cloud-native systems</strong> composed of
                microservices, third-party APIs, and decentralized data stores. The average user
                manages over 100 digital accounts across interconnected devices.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Modern identity frameworks serve as the <strong>ultimate perimeter</strong> —
                enforcing trust boundaries in a completely borderless digital ecosystem. This
                includes not only human users but also <strong>autonomous AI agents</strong> that
                interact with APIs at machine speed.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigateToSection('Authentication Types')}
          className="mt-6 inline-flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
        >
          <span>Explore Authentication Types</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </ThemeCard>
    </>
  );

  return <SectionLayout section="auth" hero={heroContent} mainContent={mainContent} />;
};

export default AuthEvolution;
