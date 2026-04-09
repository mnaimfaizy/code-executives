import React, { useState } from 'react';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { Radio, Phone, Mail, ArrowDown, Wifi, Zap } from 'lucide-react';

type ChannelType = 'webhooks' | 'websockets' | 'sse';

interface Channel {
  id: ChannelType;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  direction: string;
  analogy: string;
  mechanism: string;
  bestFor: string;
  example: string;
  pros: string[];
  cons: string[];
}

const channels: Channel[] = [
  {
    id: 'webhooks',
    title: 'Webhooks',
    icon: <Mail className="w-6 h-6" />,
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    direction: 'Server → Server',
    analogy:
      "Home mail delivery. You don't go to the post office every day to check for packages. Instead, you register your address, and the postal service delivers packages to your door when they arrive.",
    mechanism:
      'The client registers a callback URL with the server. When an event occurs, the server makes an HTTP POST to that URL with event data. No polling needed — the server tells you when something happens.',
    bestFor: 'Payment notifications, CI/CD triggers, third-party integrations',
    example:
      'Stripe sends a webhook:\nPOST https://your-app.com/webhooks/payment\n{\n  "event": "payment.succeeded",\n  "amount": 2999,\n  "currency": "usd"\n}',
    pros: ['Simple to implement', 'No persistent connection needed', 'Works across firewalls'],
    cons: ['One-directional only', 'No guaranteed delivery', 'Requires public endpoint'],
  },
  {
    id: 'websockets',
    title: 'WebSockets',
    icon: <Phone className="w-6 h-6" />,
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    direction: 'Bidirectional',
    analogy:
      'An open phone line. You call someone and both of you keep the line open. Either party can speak at any time, and the other hears it immediately — no need to hang up and call again.',
    mechanism:
      'Starts as an HTTP handshake then "upgrades" to a persistent TCP connection. Both client and server can send messages freely. The connection stays alive until either side closes it.',
    bestFor: 'Chat apps, live gaming, collaborative editing, trading platforms',
    example:
      '// Client\nconst ws = new WebSocket("wss://api.example.com/ws");\nws.onmessage = (event) => {\n  console.log("Received:", event.data);\n};\nws.send(JSON.stringify({ type: "chat", msg: "Hello!" }));',
    pros: ['True real-time bidirectional', 'Low latency', 'Efficient for high-frequency messages'],
    cons: [
      'Complex connection management',
      'Scaling challenges',
      'Stateful (harder to load-balance)',
    ],
  },
  {
    id: 'sse',
    title: 'Server-Sent Events',
    icon: <Radio className="w-6 h-6" />,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    direction: 'Server → Client',
    analogy:
      "A radio station. You tune in to a frequency and listen. The DJ (server) broadcasts news, music, and updates. You can't talk back through the radio — for that, you'd need a phone (WebSocket).",
    mechanism:
      'Uses standard HTTP with the text/event-stream content type. The server keeps the response open and periodically sends named events. Built-in browser reconnection and event IDs for resuming after disconnection.',
    bestFor: 'Live feeds, stock tickers, notifications, progress updates',
    example:
      '// Server\nres.setHeader("Content-Type", "text/event-stream");\nres.write("event: price-update\\n");\nres.write("data: {\\"symbol\\": \\"AAPL\\", \\"price\\": 178.42}\\n\\n");\n\n// Client\nconst source = new EventSource("/api/stream");\nsource.addEventListener("price-update", handler);',
    pros: ['Simple HTTP (no special protocol)', 'Auto-reconnect built-in', 'Firewall-friendly'],
    cons: ['Server-to-client only', 'Limited to text data', 'Browser connection limit (~6)'],
  },
];

const RealTimeCommunication: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<ChannelType>('websockets');
  const channel = channels.find((c) => c.id === activeChannel) || channels[1];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-zinc-50 rounded-2xl p-8 border border-slate-200 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Wifi className="w-8 h-8 text-slate-600" />
          <h1 className="text-4xl font-bold text-gray-900">Real-Time Communication</h1>
        </div>
        <p className="text-xl text-gray-700 leading-relaxed max-w-4xl">
          Traditional HTTP is strictly request-response: the client asks, the server answers, the
          conversation ends. But modern applications need the server to reach out proactively — a
          new chat message, a stock price change, a payment confirmation, a collaborative cursor
          moving in real-time. Three patterns solve this, each with different trade-offs.
        </p>
      </div>

      {/* Channel Selector */}
      <div className="grid grid-cols-3 gap-4">
        {channels.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveChannel(c.id)}
            className={`p-5 rounded-xl border-2 transition-all duration-300 text-left ${
              activeChannel === c.id
                ? `${c.bgColor} ${c.borderColor} shadow-md scale-[1.02]`
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`mb-2 ${activeChannel === c.id ? c.color : 'text-gray-400'}`}>
              {c.icon}
            </div>
            <div
              className={`text-lg font-bold ${activeChannel === c.id ? c.color : 'text-gray-700'}`}
            >
              {c.title}
            </div>
            <div className="text-xs text-gray-500 mt-1">{c.direction}</div>
          </button>
        ))}
      </div>

      {/* Direction Visualization */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Flow Pattern</h2>
        <div className="flex items-center justify-center space-x-12">
          {/* Client */}
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center mb-3 mx-auto border-2 border-blue-200">
              <div className="text-3xl">🖥️</div>
            </div>
            <div className="text-sm font-semibold text-gray-700">Client</div>
          </div>

          {/* Arrows */}
          <div className="flex flex-col items-center space-y-2">
            {activeChannel === 'webhooks' && (
              <>
                <div className="text-xs text-gray-400 mb-1">Server pushes events</div>
                <div className={`flex items-center space-x-2 ${channel.color}`}>
                  <div className="w-32 h-0.5 bg-current"></div>
                  <ArrowDown className="w-5 h-5 rotate-[-90deg]" />
                </div>
              </>
            )}
            {activeChannel === 'websockets' && (
              <>
                <div className="text-xs text-gray-400 mb-1">
                  Bidirectional persistent connection
                </div>
                <div className={`flex items-center space-x-1 ${channel.color}`}>
                  <Zap className="w-4 h-4" />
                  <div className="w-24 h-1 bg-current rounded animate-pulse"></div>
                  <Zap className="w-4 h-4" />
                </div>
                <div className={`flex items-center space-x-1 ${channel.color} opacity-50`}>
                  <Zap className="w-4 h-4" />
                  <div
                    className="w-24 h-1 bg-current rounded animate-pulse"
                    style={{ animationDelay: '0.5s' }}
                  ></div>
                  <Zap className="w-4 h-4" />
                </div>
              </>
            )}
            {activeChannel === 'sse' && (
              <>
                <div className="text-xs text-gray-400 mb-1">Server streams events</div>
                <div className={`flex items-center space-x-2 ${channel.color}`}>
                  <div className="w-32 h-0.5 bg-current"></div>
                  <ArrowDown className="w-5 h-5 rotate-[-90deg]" />
                </div>
                <div className="text-xs text-gray-300">(HTTP long-lived response)</div>
              </>
            )}
          </div>

          {/* Server */}
          <div className="text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mb-3 mx-auto border-2 border-slate-200">
              <div className="text-3xl">🖧</div>
            </div>
            <div className="text-sm font-semibold text-gray-700">Server</div>
          </div>
        </div>
      </ThemeCard>

      {/* Active Channel Detail */}
      <ThemeCard>
        <div className="flex items-center space-x-4 mb-6">
          <div
            className={`w-14 h-14 rounded-xl ${channel.bgColor} flex items-center justify-center ${channel.color}`}
          >
            {channel.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{channel.title}</h2>
            <p className="text-gray-500 text-sm">{channel.direction}</p>
          </div>
        </div>

        <p className="text-gray-700 mb-6 leading-relaxed">{channel.mechanism}</p>

        {/* Analogy */}
        <div className={`${channel.bgColor} rounded-xl p-5 mb-6 border ${channel.borderColor}`}>
          <h3 className="font-semibold text-gray-800 mb-2">💡 Analogy</h3>
          <p className="text-gray-700 italic">&ldquo;{channel.analogy}&rdquo;</p>
        </div>

        {/* Code Example */}
        <div className="bg-gray-900 rounded-xl p-5 mb-6">
          <div className="text-xs text-gray-400 mb-2">Example</div>
          <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
            {channel.example}
          </pre>
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-green-700 mb-3">✅ Pros</h3>
            <ul className="space-y-2">
              {channel.pros.map((p, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span className="text-sm text-gray-700">{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-red-700 mb-3">⚠️ Cons</h3>
            <ul className="space-y-2">
              {channel.cons.map((c, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span className="text-sm text-gray-700">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ThemeCard>

      {/* Comparison Matrix */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Feature</th>
                {channels.map((c) => (
                  <th
                    key={c.id}
                    className={`text-center py-3 px-4 font-semibold ${
                      activeChannel === c.id ? c.color : 'text-gray-600'
                    }`}
                  >
                    {c.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { feature: 'Direction', v: ['Server→Server', 'Bidirectional', 'Server→Client'] },
                { feature: 'Protocol', v: ['HTTP POST', 'WS (over TCP)', 'HTTP (long-lived)'] },
                { feature: 'Connection', v: ['Stateless', 'Persistent', 'Persistent'] },
                { feature: 'Complexity', v: ['Low', 'High', 'Low'] },
                { feature: 'Scaling', v: ['Easy', 'Challenging', 'Moderate'] },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{row.feature}</td>
                  {row.v.map((val, j) => (
                    <td
                      key={j}
                      className={`py-3 px-4 text-center ${
                        channels[j].id === activeChannel
                          ? `${channels[j].bgColor} font-semibold ${channels[j].color}`
                          : 'text-gray-600'
                      }`}
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ThemeCard>
    </div>
  );
};

export default RealTimeCommunication;
