import React, { useState } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { Shield, Users, Layers, Lock, ArrowRight, CheckCircle } from 'lucide-react';

type AuthzModel = 'rbac' | 'abac' | 'rebac' | 'zerotrust';

interface ModelDetail {
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  pros: string[];
  cons: string[];
  example: string;
  useCase: string;
}

const AuthorizationModels: React.FC = () => {
  const [activeModel, setActiveModel] = useState<AuthzModel>('rbac');

  const navigateToSection = (sectionName: string): void => {
    window.location.href = '/auth?section=' + encodeURIComponent(sectionName);
  };

  const models: Record<AuthzModel, ModelDetail> = {
    rbac: {
      title: 'Role-Based Access Control (RBAC)',
      icon: <Users className="w-8 h-8" />,
      color: 'blue',
      description:
        'Grants or denies access based entirely on the role assigned to a user. Permissions are bundled into static roles (e.g., Admin, Editor, Viewer) rather than tailored to individuals.',
      pros: [
        'Simple to implement',
        'Easy to audit',
        'Well-understood model',
        'Clear permission boundaries',
      ],
      cons: [
        'Role explosion in large orgs',
        'Insufficient for fine-grained needs',
        'Static — no context awareness',
      ],
      example:
        'All members of the sales team get the "Salesperson" role → read/write access to customer DB. Moving to HR? Role is updated, entire permission set migrates.',
      useCase: 'Small to medium applications with clear organizational hierarchy.',
    },
    abac: {
      title: 'Attribute-Based Access Control (ABAC)',
      icon: <Layers className="w-8 h-8" />,
      color: 'purple',
      description:
        'Makes dynamic, highly granular access decisions based on attributes of the user, resource, action, and environment — evaluated at runtime by a centralized policy engine.',
      pros: [
        'Extremely granular',
        'Context-aware',
        'No role explosion',
        'Supports complex policies',
      ],
      cons: [
        'Complex to architect',
        'Requires policy engine',
        'Harder to audit',
        'Higher computational cost',
      ],
      example:
        '"Allow access to financial documents IF user.department = Finance AND action = read AND time is 9AM–5PM AND request.ip is corporate."',
      useCase: 'Enterprise environments requiring dynamic, context-sensitive access control.',
    },
    rebac: {
      title: 'Relationship-Based Access Control (ReBAC)',
      icon: <Shield className="w-8 h-8" />,
      color: 'indigo',
      description:
        'Determines access based on defined relationships between entities. A user is authorized not by their role or attributes, but by their logical relationship to the resource.',
      pros: [
        'Natural for social/collaborative apps',
        'Intuitive mental model',
        'Flexible hierarchies',
        'Scales with relationships',
      ],
      cons: [
        'Graph complexity at scale',
        'Requires relationship graph DB',
        'Can be hard to reason about',
      ],
      example:
        'A user can view a document because they are the "manager" of the document\'s "creator" — not because of any role assignment.',
      useCase: 'Social networks, document collaboration, hierarchical organizations.',
    },
    zerotrust: {
      title: 'Zero Trust Architecture (ZTA)',
      icon: <Lock className="w-8 h-8" />,
      color: 'red',
      description:
        'Defined by NIST SP 800-207, Zero Trust completely abandons the concept of a trusted network. Every entity is untrusted by default. Every interaction is strongly authenticated and explicitly authorized using dynamic, continuous evaluation.',
      pros: [
        'Maximum security posture',
        'Continuous verification',
        'Micro-segmented access',
        'No implicit trust',
      ],
      cons: [
        'Complex to implement fully',
        'Requires significant infrastructure',
        'Potential latency from continuous evaluation',
      ],
      example:
        'User requests API access → system evaluates: device health ✓, location ✓, behavioral pattern ✓, time-based risk ✓ → access granted for this single request.',
      useCase: 'Enterprise and government environments with high-security requirements.',
    },
  };

  const current = models[activeModel];

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-amber-100 p-4 rounded-full">
          <Shield className="w-16 h-16 text-amber-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Enterprise Authorization Models</h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        Explore how systems enforce permissions — from static roles to continuous, context-aware
        Zero Trust evaluations.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Model Selector */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Select an Authorization Model</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {(Object.keys(models) as AuthzModel[]).map((key) => {
            const model = models[key];
            const isActive = key === activeModel;
            return (
              <button
                key={key}
                onClick={() => setActiveModel(key)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  isActive
                    ? `border-${model.color}-500 bg-${model.color}-50 shadow-md`
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div
                  className={`mx-auto mb-2 ${isActive ? `text-${model.color}-600` : 'text-gray-400'}`}
                >
                  {model.icon}
                </div>
                <span
                  className={`text-sm font-semibold ${isActive ? `text-${model.color}-700` : 'text-gray-600'}`}
                >
                  {key.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Model Details */}
        <div
          className={`bg-${current.color}-50 border border-${current.color}-200 rounded-xl p-6 transition-all`}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-3">{current.title}</h3>
          <p className="text-gray-700 mb-5 leading-relaxed">{current.description}</p>

          <div className="grid md:grid-cols-2 gap-6 mb-5">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">✅ Advantages</h4>
              <ul className="space-y-1">
                {current.pros.map((pro, i) => (
                  <li key={i} className="flex items-center space-x-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-700 mb-2">⚠️ Trade-offs</h4>
              <ul className="space-y-1">
                {current.cons.map((con, i) => (
                  <li key={i} className="flex items-center space-x-2 text-sm text-gray-700">
                    <span className="w-4 h-4 flex-shrink-0 text-red-400">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
            <h4 className="text-sm font-bold text-gray-800 mb-1">💡 Real-world Example</h4>
            <p className="text-sm text-gray-600 italic">{current.example}</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-bold text-gray-800 mb-1">🎯 Best For</h4>
            <p className="text-sm text-gray-600">{current.useCase}</p>
          </div>
        </div>
      </ThemeCard>

      {/* Comparison Table */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Side-by-Side Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-amber-50">
                <th className="px-3 py-3 text-left font-semibold text-gray-900 border-b border-amber-200">
                  Aspect
                </th>
                <th className="px-3 py-3 text-left font-semibold text-gray-900 border-b border-amber-200">
                  RBAC
                </th>
                <th className="px-3 py-3 text-left font-semibold text-gray-900 border-b border-amber-200">
                  ABAC
                </th>
                <th className="px-3 py-3 text-left font-semibold text-gray-900 border-b border-amber-200">
                  ReBAC
                </th>
                <th className="px-3 py-3 text-left font-semibold text-gray-900 border-b border-amber-200">
                  Zero Trust
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Decision basis', 'Roles', 'Attributes', 'Relationships', 'Context + Risk'],
                ['Granularity', 'Coarse', 'Fine', 'Medium', 'Very Fine'],
                ['Dynamic?', 'No', 'Yes', 'Partially', 'Continuous'],
                ['Complexity', 'Low', 'High', 'Medium', 'Very High'],
                ['Scalability', 'Limited', 'High', 'High', 'High'],
              ].map(([aspect, ...vals], i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2.5 font-medium text-gray-900 border-b border-gray-100">
                    {aspect}
                  </td>
                  {vals.map((v, j) => (
                    <td key={j} className="px-3 py-2.5 text-gray-700 border-b border-gray-100">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => navigateToSection('OAuth 2.0 & OpenID Connect')}
          className="mt-6 inline-flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
        >
          <span>Next: OAuth 2.0 & OIDC Protocols</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </ThemeCard>
    </>
  );

  return <SectionLayout section="auth" hero={heroContent} mainContent={mainContent} />;
};

export default AuthorizationModels;
