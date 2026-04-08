import React, { useState } from 'react';

interface ServiceModel {
  id: string;
  label: string;
  fullName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  pizzaAnalogy: string;
  pizzaIcon: string;
  description: string;
  layers: { name: string; managed: 'provider' | 'user' }[];
  examples: string[];
}

const SERVICE_MODELS: ServiceModel[] = [
  {
    id: 'onprem',
    label: 'On-Prem',
    fullName: 'On-Premises',
    color: '#6b7280',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    pizzaAnalogy:
      'Making pizza from scratch at home — you grow tomatoes, milk cows, knead dough, build the oven, and wash dishes.',
    pizzaIcon: '🏠',
    description: 'You manage everything: hardware, OS, runtime, middleware, and application.',
    layers: [
      { name: 'Application', managed: 'user' },
      { name: 'Data', managed: 'user' },
      { name: 'Runtime', managed: 'user' },
      { name: 'Middleware', managed: 'user' },
      { name: 'OS', managed: 'user' },
      { name: 'Virtualization', managed: 'user' },
      { name: 'Servers', managed: 'user' },
      { name: 'Storage', managed: 'user' },
      { name: 'Networking', managed: 'user' },
    ],
    examples: ['Private data centers', 'Self-managed servers'],
  },
  {
    id: 'iaas',
    label: 'IaaS',
    fullName: 'Infrastructure as a Service',
    color: '#3b82f6',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    pizzaAnalogy:
      'Buying a frozen "take & bake" pizza — the store provides ingredients, but you still need your own oven.',
    pizzaIcon: '🧊',
    description: 'Provider manages infrastructure. You manage OS, runtime, and applications.',
    layers: [
      { name: 'Application', managed: 'user' },
      { name: 'Data', managed: 'user' },
      { name: 'Runtime', managed: 'user' },
      { name: 'Middleware', managed: 'user' },
      { name: 'OS', managed: 'user' },
      { name: 'Virtualization', managed: 'provider' },
      { name: 'Servers', managed: 'provider' },
      { name: 'Storage', managed: 'provider' },
      { name: 'Networking', managed: 'provider' },
    ],
    examples: ['AWS EC2', 'Google Compute Engine', 'Azure VMs'],
  },
  {
    id: 'paas',
    label: 'PaaS',
    fullName: 'Platform as a Service',
    color: '#8b5cf6',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    pizzaAnalogy:
      'Ordering pizza delivery — the restaurant handles everything; you just set the table.',
    pizzaIcon: '🛵',
    description: 'Provider manages infrastructure and platform. You focus only on your code.',
    layers: [
      { name: 'Application', managed: 'user' },
      { name: 'Data', managed: 'user' },
      { name: 'Runtime', managed: 'provider' },
      { name: 'Middleware', managed: 'provider' },
      { name: 'OS', managed: 'provider' },
      { name: 'Virtualization', managed: 'provider' },
      { name: 'Servers', managed: 'provider' },
      { name: 'Storage', managed: 'provider' },
      { name: 'Networking', managed: 'provider' },
    ],
    examples: ['Heroku', 'Google App Engine', 'Azure App Service'],
  },
  {
    id: 'saas',
    label: 'SaaS',
    fullName: 'Software as a Service',
    color: '#10b981',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    pizzaAnalogy:
      'Dining at a restaurant — just sit down, eat, and leave. Everything is handled for you.',
    pizzaIcon: '🍕',
    description: 'Provider manages everything. You just use the software via a browser.',
    layers: [
      { name: 'Application', managed: 'provider' },
      { name: 'Data', managed: 'provider' },
      { name: 'Runtime', managed: 'provider' },
      { name: 'Middleware', managed: 'provider' },
      { name: 'OS', managed: 'provider' },
      { name: 'Virtualization', managed: 'provider' },
      { name: 'Servers', managed: 'provider' },
      { name: 'Storage', managed: 'provider' },
      { name: 'Networking', managed: 'provider' },
    ],
    examples: ['Gmail', 'Slack', 'Salesforce'],
  },
  {
    id: 'faas',
    label: 'FaaS',
    fullName: 'Function as a Service',
    color: '#f59e0b',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    pizzaAnalogy:
      'A pizza vending machine — just press a button, and a perfect slice appears instantly!',
    pizzaIcon: '⚡',
    description:
      'Just write functions. Provider handles everything else, scaling to zero when idle.',
    layers: [
      { name: 'Function Code', managed: 'user' },
      { name: 'Event Triggers', managed: 'user' },
      { name: 'Runtime', managed: 'provider' },
      { name: 'Middleware', managed: 'provider' },
      { name: 'OS', managed: 'provider' },
      { name: 'Virtualization', managed: 'provider' },
      { name: 'Servers', managed: 'provider' },
      { name: 'Storage', managed: 'provider' },
      { name: 'Networking', managed: 'provider' },
    ],
    examples: ['AWS Lambda', 'Cloud Run Functions', 'Azure Functions'],
  },
];

const CloudServiceModelsViz: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('paas');
  const [showPizzaView, setShowPizzaView] = useState(false);

  const activeModel = SERVICE_MODELS.find((m) => m.id === selectedModel) || SERVICE_MODELS[2];

  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-slate-50 via-white to-sky-50 rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Cloud Service Models</h3>
          <p className="text-sm text-gray-600">
            The shared responsibility spectrum — from full control to fully managed
          </p>
        </div>

        {/* Toggle Pizza View */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowPizzaView(!showPizzaView)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${showPizzaView ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'}`}
          >
            {showPizzaView ? '🍕 Pizza Analogy View' : '🍕 Show Pizza Analogy'}
          </button>
        </div>

        {/* Model selector tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {SERVICE_MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
                selectedModel === model.id
                  ? `${model.bgColor} ${model.borderColor} shadow-md scale-105`
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
              style={selectedModel === model.id ? { color: model.color } : {}}
            >
              {model.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Layer stack visualization */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">
              Responsibility Layers
            </h4>
            <div className="space-y-1.5">
              {activeModel.layers.map((layer, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg border transition-all duration-300 ${
                    layer.managed === 'provider'
                      ? `${activeModel.bgColor} ${activeModel.borderColor}`
                      : 'bg-slate-50 border-slate-300'
                  }`}
                  style={{
                    opacity: 0,
                    animation: `fadeSlideIn 0.3s ease-out ${index * 0.05}s forwards`,
                  }}
                >
                  <span className="font-medium text-sm text-gray-800">{layer.name}</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      layer.managed === 'provider'
                        ? 'bg-white text-gray-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {layer.managed === 'provider' ? '☁️ Provider' : '👤 You'}
                  </span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded ${activeModel.bgColor} ${activeModel.borderColor} border`}
                />
                <span>Cloud Provider manages</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-slate-50 border border-slate-300" />
                <span>You manage</span>
              </div>
            </div>
          </div>

          {/* Info panel */}
          <div className="space-y-4">
            {/* Model details */}
            <div
              className={`${activeModel.bgColor} rounded-xl p-5 border ${activeModel.borderColor}`}
            >
              <h4 className="text-lg font-bold text-gray-900 mb-1">{activeModel.fullName}</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{activeModel.description}</p>
            </div>

            {/* Pizza analogy */}
            {showPizzaView && (
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{activeModel.pizzaIcon}</span>
                  <div>
                    <h4 className="font-bold text-amber-900 mb-1">Pizza Analogy</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {activeModel.pizzaAnalogy}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Examples */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h4 className="text-sm font-bold text-gray-800 mb-3">Real-World Examples</h4>
              <div className="flex flex-wrap gap-2">
                {activeModel.examples.map((ex, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-700 border border-gray-200"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>

            {/* Responsibility meter */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h4 className="text-sm font-bold text-gray-800 mb-3">Management Burden</h4>
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(activeModel.layers.filter((l) => l.managed === 'user').length / activeModel.layers.length) * 100}%`,
                    backgroundColor: activeModel.color,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Fully Managed</span>
                <span>Full Control</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default React.memo(CloudServiceModelsViz);
