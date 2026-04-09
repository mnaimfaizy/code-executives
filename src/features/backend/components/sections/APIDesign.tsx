import React, { useState } from 'react';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { Globe, Zap, Cpu, ArrowRight, ArrowLeftRight } from 'lucide-react';

type APIType = 'rpc' | 'soap' | 'rest' | 'graphql' | 'grpc';

interface APIInfo {
  id: APIType;
  title: string;
  era: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  format: string;
  flexibility: string;
  speed: string;
  bestFor: string;
  analogy: string;
  mechanism: string;
  example: string;
}

const apis: APIInfo[] = [
  {
    id: 'rpc',
    title: 'RPC',
    era: '1970s',
    icon: <Cpu className="w-6 h-6" />,
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    format: 'Binary/Custom',
    flexibility: 'Low',
    speed: 'Fast',
    bestFor: 'Internal system-to-system calls',
    analogy:
      'A TV remote control. You point it at the TV and press "Volume Up." You\'re calling a function on a remote device as if it were local — but under the hood, an infrared signal crosses the room.',
    mechanism:
      'Remote Procedure Call (RPC) lets a program call a function on a remote machine as if it were a local function call. The network complexity is hidden behind a "stub" that marshals arguments into bytes, sends them over the wire, and unmarshals the response. Early implementations (Sun RPC, CORBA) were platform-specific and tightly coupled — caller and callee had to agree on exact data formats and needed to be online simultaneously.',
    example:
      '// Conceptual RPC call\nresult = remote_server.calculateTax(order_id, amount)\n// Under the hood:\n// 1. Serialize (order_id, amount) to bytes\n// 2. Send TCP packet to remote_server:8080\n// 3. Remote deserializes → runs calculateTax()\n// 4. Serialize result → send back to caller',
  },
  {
    id: 'soap',
    title: 'SOAP',
    era: '1998',
    icon: <Globe className="w-6 h-6" />,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    format: 'XML',
    flexibility: 'Low (Rigid)',
    speed: 'Slow',
    bestFor: 'Enterprise integrations requiring strict contracts',
    analogy:
      'A formal legal contract. You want a cup of coffee, but first you must fill out a 10-page XML document specifying the roast type, cup size, sugar level, delivery address, and return policy. Extremely thorough but painfully slow for simple requests.',
    mechanism:
      'Simple Object Access Protocol wraps every message in an XML "envelope" with a Header (metadata, authentication) and Body (the actual request). Services are described in WSDL (Web Services Description Language) files — machine-readable contracts that define every operation, input, and output. Built-in WS-Security, WS-ReliableMessaging, and WS-Transaction standards made it the enterprise choice in the 2000s, but the verbosity of XML and complexity of the WS-* specifications drove developers toward simpler alternatives.',
    example:
      '<?xml version="1.0"?>\n<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/...">\n  <soap:Header>\n    <auth:Token>abc123</auth:Token>\n  </soap:Header>\n  <soap:Body>\n    <GetUser>\n      <UserId>123</UserId>\n    </GetUser>\n  </soap:Body>\n</soap:Envelope>',
  },
  {
    id: 'rest',
    title: 'REST',
    era: '2000',
    icon: <Globe className="w-6 h-6" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    format: 'JSON/Text',
    flexibility: 'Moderate',
    speed: 'Good',
    bestFor: 'Public APIs, Web/Mobile apps',
    analogy:
      "A fast-food counter. You walk up, order by number, pay, and leave. The person behind the counter doesn't need to know your life story to give you a burger. Simple, standardized, and stateless.",
    mechanism:
      "Defined by Roy Fielding's 2000 PhD dissertation, REST uses standard HTTP verbs as a universal vocabulary: GET (retrieve), POST (create), PUT (update), DELETE (remove). Every resource has a unique URL. Responses are typically JSON. The key constraint is statelessness — every request must contain everything needed (no server-side session). This makes REST APIs trivially cacheable and horizontally scalable. REST became the de facto standard for public APIs because of its simplicity — if you understand HTTP, you understand REST.",
    example:
      'GET    /api/users/123          → Retrieve user 123\nPOST   /api/orders             → Create new order\nPUT    /api/users/123/email    → Update user email\nDELETE /api/posts/456          → Delete post 456\n\nResponse: { "id": 123, "name": "Alice", "orders": [...] }',
  },
  {
    id: 'graphql',
    title: 'GraphQL',
    era: '2015',
    icon: <ArrowLeftRight className="w-6 h-6" />,
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    format: 'JSON/Text',
    flexibility: 'Very High',
    speed: 'Variable',
    bestFor: 'Complex UI requirements, mobile apps',
    analogy:
      'A personal shopper. Instead of buying pre-packaged outfits, you hand them a specific list: "I want a blue silk tie and grey cotton socks — nothing else." They find exactly those items. No over-fetching bulky outfits, no under-fetching missing accessories.',
    mechanism:
      'Developed internally at Facebook in 2012 (open-sourced 2015) to solve REST\'s over-fetching problem — mobile apps were downloading entire user objects just to show a name. With GraphQL, clients specify exactly which fields they need in a typed query language. A single endpoint handles all queries. The server resolves fields using "resolvers" that can fetch from any data source. Includes built-in type system, introspection (API is self-documenting), and real-time subscriptions.',
    example:
      'query {\n  user(id: 123) {\n    name\n    email\n    orders(last: 5) {\n      total\n      status\n    }\n  }\n}\n\n# Mutation\nmutation {\n  updateEmail(id: 123, email: "new@mail.com") {\n    success\n  }\n}',
  },
  {
    id: 'grpc',
    title: 'gRPC',
    era: '2015',
    icon: <Zap className="w-6 h-6" />,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    format: 'Protobuf/Binary',
    flexibility: 'Low (Rigid)',
    speed: 'Very High',
    bestFor: 'Fast service-to-service communication',
    analogy:
      'A high-speed pneumatic tube system in a large bank. Incredibly fast and efficient — messages compressed into tiny capsules that zip through the tubes. Designed for the bank staff (internal services), not customers (public users) who need friendly interfaces.',
    mechanism:
      "Created by Google (open-sourced 2015). Uses binary Protocol Buffers (Protobuf) instead of text JSON — messages are 5-10x smaller and much faster to serialize/deserialize. Built on HTTP/2 with multiplexed streams, enabling bidirectional streaming where client and server talk back and forth simultaneously over a single connection. Code generation from .proto schema files means type-safe clients in 12+ languages. The trade-off: binary format is not human-readable (can't test with curl), and browser support requires a proxy layer (gRPC-Web).",
    example:
      '// user.proto schema\nservice UserService {\n  rpc GetUser(UserRequest)\n    returns (UserResponse);\n  rpc StreamOrders(OrderFilter)\n    returns (stream Order);  // Server streaming\n}\n\nmessage UserRequest {\n  int32 id = 1;\n}\nmessage UserResponse {\n  string name = 1;\n  string email = 2;\n}',
  },
];

const APIDesign: React.FC = () => {
  const [activeAPI, setActiveAPI] = useState<APIType>('rest');
  const api = apis.find((a) => a.id === activeAPI) || apis[0];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-zinc-50 rounded-2xl p-8 border border-slate-200 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Zap className="w-8 h-8 text-slate-600" />
          <h1 className="text-4xl font-bold text-gray-900">API Design</h1>
        </div>
        <p className="text-xl text-gray-700 leading-relaxed max-w-4xl">
          An API (Application Programming Interface) is the bridge that allows two different
          software systems to talk to each other. Like a waiter in a restaurant — you never go into
          the kitchen yourself. The waiter takes your order, relays it, and brings back your meal.
          Over five decades, APIs have evolved from tightly-coupled procedure calls to flexible,
          self-documenting query languages.
        </p>
      </div>

      {/* API Selector */}
      <div className="grid grid-cols-5 gap-3">
        {apis.map((a) => (
          <button
            key={a.id}
            onClick={() => setActiveAPI(a.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
              activeAPI === a.id
                ? `${a.bgColor} ${a.borderColor} ${a.color} shadow-md scale-105`
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className="flex justify-center mb-2">{a.icon}</div>
            <div className="text-sm font-bold">{a.title}</div>
            <div className="text-[10px] text-gray-500">{a.era}</div>
          </button>
        ))}
      </div>

      {/* Active API Detail */}
      <ThemeCard>
        <div className="flex items-center space-x-4 mb-6">
          <div
            className={`w-14 h-14 rounded-xl ${api.bgColor} flex items-center justify-center ${api.color}`}
          >
            {api.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{api.title}</h2>
            <p className="text-gray-500">{api.bestFor}</p>
          </div>
        </div>

        <p className="text-gray-700 mb-6 leading-relaxed">{api.mechanism}</p>

        {/* Analogy */}
        <div className={`${api.bgColor} rounded-xl p-5 mb-6 border ${api.borderColor}`}>
          <h3 className="font-semibold text-gray-800 mb-2">💡 Analogy</h3>
          <p className="text-gray-700 italic">&ldquo;{api.analogy}&rdquo;</p>
        </div>

        {/* Code example */}
        <div className="bg-gray-900 rounded-xl p-5 mb-6">
          <div className="text-xs text-gray-400 mb-2">Example</div>
          <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">{api.example}</pre>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Data Format', value: api.format },
            { label: 'Flexibility', value: api.flexibility },
            { label: 'Speed', value: api.speed },
            { label: 'Era', value: api.era },
          ].map((m, i) => (
            <div
              key={i}
              className={`${api.bgColor} rounded-lg p-3 text-center border ${api.borderColor}`}
            >
              <div className="text-xs text-gray-500 mb-1">{m.label}</div>
              <div className={`font-semibold ${api.color} text-sm`}>{m.value}</div>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Evolution timeline */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Five Generations of API Design</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Each generation solved specific problems of its predecessor while introducing new
          trade-offs.
        </p>
        <div className="space-y-4">
          {[
            {
              era: '1970s',
              name: 'RPC',
              desc: 'Call remote functions as if they were local — simple but tightly coupled',
              color: 'bg-gray-200 text-gray-700',
            },
            {
              era: '1998',
              name: 'SOAP',
              desc: 'XML envelopes with strict contracts (WSDL) — enterprise but verbose',
              color: 'bg-amber-100 text-amber-700',
            },
            {
              era: '2000',
              name: 'REST',
              desc: 'HTTP verbs + JSON + statelessness — the universal web standard',
              color: 'bg-blue-100 text-blue-700',
            },
            {
              era: '2015',
              name: 'GraphQL',
              desc: 'Client-driven queries solving over-fetching — the personal shopper',
              color: 'bg-pink-100 text-pink-700',
            },
            {
              era: '2015',
              name: 'gRPC',
              desc: 'Binary Protobuf over HTTP/2 — the high-speed internal highway',
              color: 'bg-emerald-100 text-emerald-700',
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-20 text-xs text-gray-500 font-semibold text-right flex-shrink-0">
                {item.era}
              </div>
              <div className="w-3 h-3 rounded-full bg-slate-400 flex-shrink-0"></div>
              <div className={`flex-1 ${item.color} rounded-lg px-4 py-3`}>
                <div className="flex items-center space-x-2">
                  <span className="font-bold">{item.name}</span>
                  <ArrowRight className="w-3 h-3 opacity-50" />
                  <span className="text-sm">{item.desc}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Comparison Table */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">API Standard Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Standard</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Format</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Flexibility</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Speed</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Best For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {apis.map((a) => (
                <tr
                  key={a.id}
                  className={`hover:bg-gray-50 cursor-pointer ${activeAPI === a.id ? a.bgColor : ''}`}
                  onClick={() => setActiveAPI(a.id)}
                >
                  <td className={`py-3 px-4 font-semibold ${a.color}`}>{a.title}</td>
                  <td className="py-3 px-4 text-gray-700">{a.format}</td>
                  <td className="py-3 px-4 text-gray-700">{a.flexibility}</td>
                  <td className="py-3 px-4 text-gray-700">{a.speed}</td>
                  <td className="py-3 px-4 text-gray-700 text-xs">{a.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ThemeCard>
    </div>
  );
};

export default APIDesign;
