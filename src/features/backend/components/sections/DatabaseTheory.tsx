import React, { useState } from 'react';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { Database, Scale, Triangle, Lock, Unlock } from 'lucide-react';

type CAPChoice = 'CP' | 'AP' | null;

const DatabaseTheory: React.FC = () => {
  const [capChoice, setCapChoice] = useState<CAPChoice>(null);
  const [activeTab, setActiveTab] = useState<'acid' | 'base'>('acid');

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-zinc-50 rounded-2xl p-8 border border-slate-200 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Database className="w-8 h-8 text-slate-600" />
          <h1 className="text-4xl font-bold text-gray-900">Database Theory</h1>
        </div>
        <p className="text-xl text-gray-700 leading-relaxed max-w-4xl">
          At the core of every backend is a database. When your data lives on a single machine,
          everything is simple. But in a world where data is spread across data centers on different
          continents, the speed of light itself creates a fundamental trade-off: you cannot
          simultaneously have the &ldquo;absolute latest truth&rdquo; and &ldquo;always be available
          to answer.&rdquo; This is the central tension of distributed data systems.
        </p>
      </div>

      {/* CAP Theorem Interactive */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-4">
          <Triangle className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">The CAP Theorem</h2>
        </div>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Proven by Eric Brewer in 2000 and formally proved in 2002, the CAP Theorem states that a
          distributed data store can only guarantee <strong>two of three</strong> properties
          simultaneously: <strong>Consistency</strong> (every read receives the most recent write),{' '}
          <strong>Availability</strong> (every request gets a non-error response), and{' '}
          <strong>Partition Tolerance</strong> (the system continues to operate despite network
          failures between nodes). Since network partitions are <em>inevitable</em> in any
          distributed system, the real choice is:
          <strong> Consistency + Partition (CP)</strong> or{' '}
          <strong>Availability + Partition (AP)</strong>.
        </p>

        {/* Interactive Triangle */}
        <div className="flex justify-center mb-6">
          <svg
            viewBox="0 0 400 360"
            className="w-full max-w-md"
            role="img"
            aria-label="CAP Theorem triangle"
          >
            {/* Triangle */}
            <polygon points="200,30 50,320 350,320" fill="none" stroke="#cbd5e1" strokeWidth="2" />

            {/* Edges */}
            <line
              x1="200"
              y1="30"
              x2="50"
              y2="320"
              stroke={capChoice === 'CP' ? '#6366f1' : '#e2e8f0'}
              strokeWidth={capChoice === 'CP' ? 4 : 2}
            />
            <line
              x1="200"
              y1="30"
              x2="350"
              y2="320"
              stroke={capChoice === 'AP' ? '#10b981' : '#e2e8f0'}
              strokeWidth={capChoice === 'AP' ? 4 : 2}
            />
            <line x1="50" y1="320" x2="350" y2="320" stroke="#e2e8f0" strokeWidth="2" />

            {/* C node */}
            <g onClick={() => setCapChoice('CP')} className="cursor-pointer">
              <circle
                cx="200"
                cy="30"
                r="35"
                fill={capChoice === 'CP' ? '#eef2ff' : '#f8fafc'}
                stroke={capChoice === 'CP' ? '#6366f1' : '#94a3b8'}
                strokeWidth="2"
              />
              <text
                x="200"
                y="28"
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill={capChoice === 'CP' ? '#4338ca' : '#475569'}
              >
                Consistency
              </text>
              <text x="200" y="42" textAnchor="middle" fontSize="9" fill="#6b7280">
                (C)
              </text>
            </g>

            {/* A node */}
            <g onClick={() => setCapChoice('AP')} className="cursor-pointer">
              <circle
                cx="350"
                cy="320"
                r="35"
                fill={capChoice === 'AP' ? '#ecfdf5' : '#f8fafc'}
                stroke={capChoice === 'AP' ? '#10b981' : '#94a3b8'}
                strokeWidth="2"
              />
              <text
                x="350"
                y="318"
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill={capChoice === 'AP' ? '#065f46' : '#475569'}
              >
                Availability
              </text>
              <text x="350" y="332" textAnchor="middle" fontSize="9" fill="#6b7280">
                (A)
              </text>
            </g>

            {/* P node */}
            <g>
              <circle cx="50" cy="320" r="35" fill="#fefce8" stroke="#eab308" strokeWidth="2" />
              <text
                x="50"
                y="318"
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill="#854d0e"
              >
                Partition
              </text>
              <text x="50" y="332" textAnchor="middle" fontSize="9" fill="#6b7280">
                (P) Always
              </text>
            </g>

            {/* Labels on edges */}
            {capChoice === 'CP' && (
              <text
                x="100"
                y="170"
                textAnchor="middle"
                fontSize="10"
                fill="#6366f1"
                fontWeight="bold"
                transform="rotate(-55 100 170)"
              >
                CP: Strong Consistency
              </text>
            )}
            {capChoice === 'AP' && (
              <text
                x="300"
                y="170"
                textAnchor="middle"
                fontSize="10"
                fill="#10b981"
                fontWeight="bold"
                transform="rotate(55 300 170)"
              >
                AP: High Availability
              </text>
            )}
          </svg>
        </div>

        {/* Choice feedback */}
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={() => setCapChoice('CP')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              capChoice === 'CP'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Lock className="w-4 h-4 inline mr-2" />
            CP: Consistency
          </button>
          <button
            onClick={() => setCapChoice('AP')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              capChoice === 'AP'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Unlock className="w-4 h-4 inline mr-2" />
            AP: Availability
          </button>
        </div>

        {capChoice && (
          <div
            className={`rounded-xl p-4 border transition-all duration-300 ${
              capChoice === 'CP'
                ? 'bg-indigo-50 border-indigo-200'
                : 'bg-emerald-50 border-emerald-200'
            }`}
          >
            {capChoice === 'CP' ? (
              <div className="text-indigo-800 text-sm space-y-2">
                <p>
                  <strong>CP Systems</strong> sacrifice availability during network partitions to
                  ensure every read returns the latest write. When a partition occurs, the system
                  blocks or returns an error rather than serving potentially stale data.
                </p>
                <p className="text-xs">
                  <strong>Examples:</strong> MongoDB (in replica set mode), HBase, Redis Cluster,
                  Zookeeper, etcd. <strong>Best for:</strong> Banking transactions, payment
                  processing, inventory counts — anywhere stale data means real money lost.
                </p>
              </div>
            ) : (
              <div className="text-emerald-800 text-sm space-y-2">
                <p>
                  <strong>AP Systems</strong> sacrifice consistency during network partitions to
                  remain responsive. Every node answers every request, but different nodes may
                  temporarily return different (stale) values until they sync up.
                </p>
                <p className="text-xs">
                  <strong>Examples:</strong> Cassandra, DynamoDB, CouchDB, Riak.
                  <strong> Best for:</strong> Social media feeds, product catalogs, user session
                  stores — where showing slightly stale data is far better than showing nothing.
                </p>
              </div>
            )}
          </div>
        )}
      </ThemeCard>

      {/* ACID vs BASE */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-4">
          <Scale className="w-6 h-6 text-slate-600" />
          <h2 className="text-2xl font-bold text-gray-900">ACID vs BASE</h2>
        </div>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Two competing philosophies for how databases handle transactions in distributed systems.
          Think of them as opposite ends of a spectrum: ACID prioritizes correctness at the cost of
          performance, while BASE prioritizes availability and speed at the cost of immediate
          consistency.
        </p>

        {/* Tab selector */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('acid')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'acid'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🏦 ACID
          </button>
          <button
            onClick={() => setActiveTab('base')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'base'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🚀 BASE
          </button>
        </div>

        {/* ACID Content */}
        {activeTab === 'acid' && (
          <div className="space-y-4">
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
              <h3 className="text-xl font-bold text-indigo-800 mb-2">ACID: The Strict Enforcer</h3>
              <p className="text-gray-700 text-sm mb-4 italic">
                Like a high-security bank vault — takes time to open and follows strict security
                protocols, but your money is exactly where it belongs. Every transaction is
                verified, recorded, and irreversible. Used by: PostgreSQL, MySQL (InnoDB), Oracle,
                SQL Server.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    letter: 'A',
                    name: 'Atomicity',
                    desc: '"All or Nothing" — if a $100 transfer fails midway, the whole transaction is undone.',
                  },
                  {
                    letter: 'C',
                    name: 'Consistency',
                    desc: 'Database always moves from one valid state to another, following all rules.',
                  },
                  {
                    letter: 'I',
                    name: 'Isolation',
                    desc: "Transactions don't interfere — if two people buy the last ticket, one wins cleanly.",
                  },
                  {
                    letter: 'D',
                    name: 'Durability',
                    desc: 'Once "Success" is returned, data survives power outages and crashes.',
                  },
                ].map((item) => (
                  <div
                    key={item.letter}
                    className="bg-white rounded-lg p-4 border border-indigo-100"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {item.letter}
                      </span>
                      <span className="font-semibold text-indigo-800">{item.name}</span>
                    </div>
                    <p className="text-gray-600 text-xs">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BASE Content */}
        {activeTab === 'base' && (
          <div className="space-y-4">
            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
              <h3 className="text-xl font-bold text-emerald-800 mb-2">
                BASE: The Flexible Speedster
              </h3>
              <p className="text-gray-700 text-sm mb-4 italic">
                Like a rumor at a party — not everyone hears the news at the same second, but
                eventually everyone knows the same story. Much faster and more scalable than ACID
                because nodes don&apos;t need to coordinate on every write. Used by: Cassandra,
                DynamoDB, MongoDB (default mode), CouchDB.
              </p>
              <div className="space-y-4">
                {[
                  {
                    letter: 'BA',
                    name: 'Basically Available',
                    desc: 'The system always gives an answer, even if slightly stale or out of date.',
                  },
                  {
                    letter: 'S',
                    name: 'Soft State',
                    desc: 'Data can change over time even without new input as it syncs across global nodes.',
                  },
                  {
                    letter: 'E',
                    name: 'Eventual Consistency',
                    desc: 'If no new updates are made, everyone will eventually see the same data.',
                  },
                ].map((item) => (
                  <div
                    key={item.letter}
                    className="bg-white rounded-lg p-4 border border-emerald-100"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        {item.letter}
                      </span>
                      <span className="font-semibold text-emerald-800">{item.name}</span>
                    </div>
                    <p className="text-gray-600 text-xs">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Feature</th>
                <th className="text-left py-3 px-4 font-semibold text-indigo-700">ACID</th>
                <th className="text-left py-3 px-4 font-semibold text-emerald-700">BASE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ['Consistency', 'Strong (Immediate)', 'Weak (Eventual)'],
                ['Availability', 'Lower (Can go offline for safety)', 'High (Always responding)'],
                ['Scaling', 'Vertical (Bigger Machines)', 'Horizontal (More Machines)'],
                ['Use Cases', 'Banking, Payments, Inventory', 'Social Feeds, Product Catalogs'],
                ['CAP Path', 'CP (Consistency + Partition)', 'AP (Availability + Partition)'],
              ].map(([feature, acid, base], i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold text-gray-800">{feature}</td>
                  <td className="py-3 px-4 text-gray-700">{acid}</td>
                  <td className="py-3 px-4 text-gray-700">{base}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ThemeCard>
    </div>
  );
};

export default DatabaseTheory;
