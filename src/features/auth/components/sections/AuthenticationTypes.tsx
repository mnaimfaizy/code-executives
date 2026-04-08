import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import {
  Shield,
  Fingerprint,
  Smartphone,
  Key,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

const AuthenticationTypes: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    window.location.href = '/auth?section=' + encodeURIComponent(sectionName);
  };

  const methods = [
    {
      name: 'Passwords',
      security: 'Low',
      phishing: 'None',
      mechanism: 'Shared secrets, susceptible to database leaks and reuse',
      icon: <Key className="w-6 h-6" />,
      color: 'red',
      barWidth: 'w-1/6',
    },
    {
      name: 'SMS / TOTP MFA',
      security: 'Moderate',
      phishing: 'Very Low',
      mechanism: 'One-time codes, vulnerable to SIM-swapping and AiTM proxy tools',
      icon: <Smartphone className="w-6 h-6" />,
      color: 'orange',
      barWidth: 'w-2/6',
    },
    {
      name: 'Push Notifications',
      security: 'Moderate',
      phishing: 'Low',
      mechanism: 'Out-of-band mobile prompts, vulnerable to MFA fatigue attacks',
      icon: <Smartphone className="w-6 h-6" />,
      color: 'yellow',
      barWidth: 'w-3/6',
    },
    {
      name: 'Hardware FIDO Keys',
      security: 'Extremely High',
      phishing: 'Excellent',
      mechanism: 'Asymmetric cryptography bound to physical possession',
      icon: <Shield className="w-6 h-6" />,
      color: 'emerald',
      barWidth: 'w-5/6',
    },
    {
      name: 'Passkeys / WebAuthn',
      security: 'High',
      phishing: 'Excellent',
      mechanism: 'Syncable asymmetric cryptography bound to origin domain; unlocked via biometrics',
      icon: <Fingerprint className="w-6 h-6" />,
      color: 'green',
      barWidth: 'w-full',
    },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-amber-100 p-4 rounded-full">
          <Fingerprint className="w-16 h-16 text-amber-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Authentication Types & Technologies</h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        From passwords to passkeys — understand every authentication method, its security
        properties, and why the industry is going passwordless.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Security Comparison */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Authentication Security Spectrum</h2>
        <div className="space-y-4">
          {methods.map((method, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:border-amber-200 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 bg-${method.color}-100 rounded-lg flex items-center justify-center text-${method.color}-600`}
                  >
                    {method.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{method.name}</h3>
                    <p className="text-xs text-gray-500">{method.mechanism}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-semibold text-${method.color}-700`}>
                    {method.security}
                  </span>
                  <p className="text-xs text-gray-500">Phishing: {method.phishing}</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`${method.barWidth} bg-gradient-to-r from-${method.color}-400 to-${method.color}-600 h-2.5 rounded-full transition-all duration-500`}
                />
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* WebAuthn Deep Dive */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          <Fingerprint className="w-6 h-6 inline mr-2 text-amber-600" />
          WebAuthn & Passkeys: The Passwordless Revolution
        </h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          True passwordless means <strong>entirely removing the concept of a shared secret</strong>{' '}
          from the security model. WebAuthn (W3C) and FIDO2 protocols use public-key asymmetric
          cryptography combined with biometric verification for near-perfect phishing resistance.
        </p>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">How WebAuthn Works</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-amber-800 mb-2">📝 Registration</h4>
              <ol className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="bg-amber-200 text-amber-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Device generates an <strong>asymmetric key pair</strong>
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="bg-amber-200 text-amber-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    <strong>Private key</strong> never leaves device's secure hardware (TPM, Secure
                    Enclave)
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="bg-amber-200 text-amber-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    <strong>Public key</strong> is sent to and stored on the server
                  </span>
                </li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-orange-800 mb-2">🔐 Authentication</h4>
              <ol className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="bg-orange-200 text-orange-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Server sends a random <strong>challenge</strong>
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="bg-orange-200 text-orange-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    User unlocks device via <strong>biometric</strong> (FaceID, TouchID)
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="bg-orange-200 text-orange-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Device <strong>signs challenge</strong> with private key; server verifies with
                    public key
                  </span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-3 bg-green-50 rounded-xl p-4 border border-green-200">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">
            <strong>No secret is ever transmitted over the network.</strong> There's nothing for an
            attacker to steal in a database breach or intercept via a man-in-the-middle attack.
          </p>
        </div>
      </ThemeCard>

      {/* MFA Vulnerabilities */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          <AlertTriangle className="w-6 h-6 inline mr-2 text-red-500" />
          Why Legacy MFA Is Being Deprecated
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              attack: 'SIM Swapping',
              target: 'SMS OTP',
              desc: "Attacker convinces carrier to transfer victim's number to a new SIM, intercepting all SMS codes.",
              severity: 'High',
            },
            {
              attack: 'AiTM Phishing',
              target: 'SMS & TOTP',
              desc: 'Adversary-in-the-middle proxy kits seamlessly relay OTP codes to the attacker in real-time.',
              severity: 'Critical',
            },
            {
              attack: 'MFA Fatigue',
              target: 'Push Notifications',
              desc: 'Attacker spams approval requests until the frustrated user accidentally clicks "Approve".',
              severity: 'High',
            },
          ].map((item, i) => (
            <div key={i} className="bg-red-50 rounded-xl p-5 border border-red-100">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold text-red-600 uppercase">{item.severity}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{item.attack}</h3>
              <p className="text-xs text-gray-500 mb-2">Targets: {item.target}</p>
              <p className="text-sm text-gray-700">{item.desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigateToSection('Authorization Models')}
          className="mt-6 inline-flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
        >
          <span>Next: Authorization Models</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </ThemeCard>
    </>
  );

  return <SectionLayout section="auth" hero={heroContent} mainContent={mainContent} />;
};

export default AuthenticationTypes;
