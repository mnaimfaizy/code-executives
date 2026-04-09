import React, { useState } from 'react';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { Clock, Cpu, Globe, Database, Cloud, Box, ChevronRight } from 'lucide-react';

interface EraData {
  id: string;
  era: string;
  years: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  characteristics: string[];
  paradigm: string;
  analogy: string;
  details: string;
}

const eras: EraData[] = [
  {
    id: 'foundations',
    era: '1950s–1960s',
    years: '1950s–1960s',
    title: 'Hardware Intimacy',
    icon: <Cpu className="w-6 h-6" />,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    characteristics: [
      'FORTRAN (1957) — first high-level language, math in near-English',
      'Programs punched on physical cards, fed into room-sized mainframes',
      'No operating systems — one program ran at a time on one machine',
      'The "Spaghetti Code" crisis (1968) — NATO coins "Software Engineering"',
    ],
    paradigm: 'Hardware-Centric',
    analogy:
      'A blacksmith forging each tool by hand for one specific purpose — powerful but impossible to mass-produce',
    details:
      'In the earliest era, software was inseparable from hardware. Each program was written for a specific machine using assembly or early languages like FORTRAN (1957) and COBOL (1959). Programs were punched onto physical cards and fed into room-sized mainframes that cost millions. There was no concept of an "operating system" — a single program ran on a single machine at a time. Developers managed instruction timing and minimized instruction counts in inner loops manually. By the late 1960s, projects routinely ran over budget and behind schedule, culminating in the famous NATO Software Engineering Conference of 1968, which formally named the "software crisis" and called for structured engineering practices. The solution was structured programming — replacing chaotic GOTO jumps with logical if/else blocks and subroutines.',
  },
  {
    id: 'relational',
    era: '1970s–1980s',
    years: '1970s–1980s',
    title: 'Relational Revolution',
    icon: <Database className="w-6 h-6" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    characteristics: [
      "Codd's Relational Model (1970) — data as tables, not pointer mazes",
      'SQL becomes the universal language for querying data',
      'Unix (1971) + C (1973) — portable OS, write once compile anywhere',
      'Data and logic begin to separate — the birth of the database layer',
    ],
    paradigm: 'Data-Centric',
    analogy:
      'A filing cabinet with labeled drawers — you ask for "all invoices from March" instead of navigating a maze of folders',
    details:
      "Edgar F. Codd's landmark 1970 paper 'A Relational Model of Data for Large Shared Data Banks' at IBM revolutionized data storage. Before Codd, databases were hierarchical — navigating data meant following complex pointer chains. The relational model introduced tables, rows, and columns, letting you ask plain-language questions via SQL. Meanwhile, Ken Thompson and Dennis Ritchie created Unix (1971) and the C language (1973) at Bell Labs, making operating systems portable for the first time. These twin innovations — relational data and portable OS — decoupled software from specific hardware and created the foundation for modern backends. Oracle (1979) and IBM DB2 (1983) commercialized the relational model, making it the industry standard.",
  },
  {
    id: 'client-server',
    era: '1990s',
    years: '1990s',
    title: 'Client-Server & Web',
    icon: <Globe className="w-6 h-6" />,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    characteristics: [
      'IBM Era mainframes → PC Era (1980s) democratized computing',
      'Tim Berners-Lee invents the World Wide Web (1990)',
      'JavaScript born in 10 days at Netscape (1995)',
      'Two-tier then three-tier architectures emerge (Client → Server → DB)',
    ],
    paradigm: 'Tiered Architecture',
    analogy:
      'A restaurant — the customer (Client) places an order, the waiter (Web Server) relays it to the kitchen (Backend), and returns the dish',
    details:
      'The IBM Era of the mid-20th century was dominated by massive mainframes accessed via "dumb terminals" that had no processing power. The 1980s PC revolution democratized computing — suddenly every desk had real processing power, leading to the true client-server model. Tim Berners-Lee invented the World Wide Web in 1990 at CERN, and by 1995 Brendan Eich famously created JavaScript in just 10 days at Netscape to add interactivity to web pages. The backend evolved from simple file servers to three-tier architectures: a Presentation tier (browser), a Logic tier (application server), and a Data tier (database). Technologies like CGI scripts, PHP (1995), and Java Servlets (1997) enabled dynamic server-side content, replacing static HTML pages with interactive web applications.',
  },
  {
    id: 'cloud',
    era: '2000s',
    years: '2000s',
    title: 'Cloud & SaaS',
    icon: <Cloud className="w-6 h-6" />,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    characteristics: [
      'SOA (late 1990s) — "software as a collection of loosely coupled services"',
      'AWS launches EC2 & S3 (2006) — rent servers by the hour',
      'Salesforce pioneers SaaS — software delivered over the internet',
      'Virtual machines decouple code from physical hardware entirely',
    ],
    paradigm: 'Virtualized Utility',
    analogy:
      'Renting electricity from a power grid instead of owning your own generator — pay only for what you use',
    details:
      'As companies like Amazon, Google, and eBay scaled to millions of users, monolithic applications became a liability — deploying a single change meant rebuilding and restarting the entire system. Service-Oriented Architecture (SOA) emerged in the late 1990s, proposing that software should be a collection of independent, loosely coupled services communicating over standard protocols. Then came the cloud revolution: Amazon Web Services launched EC2 and S3 in 2006, letting anyone rent virtual servers by the hour. Salesforce pioneered the SaaS model, delivering software entirely over the internet. This era transformed the backend from a physical asset ("we own servers") into a utility ("we rent compute"). Businesses could scale from zero to millions of users without purchasing a single rack of hardware.',
  },
  {
    id: 'modern',
    era: '2010s–Present',
    years: '2010s–Present',
    title: 'Containers & Microservices',
    icon: <Box className="w-6 h-6" />,
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    characteristics: [
      'Docker (2013) — "build once, run anywhere" with lightweight containers',
      'Kubernetes (2014) — Google open-sources container orchestration',
      'Each microservice owns its own database ("database per service")',
      'Serverless (AWS Lambda 2014) — pay per millisecond of execution',
    ],
    paradigm: 'Distributed Modules',
    analogy:
      'A city of specialized shops — butcher, baker, candlestick maker — communicating via delivery services. If the baker runs out of flour, people can still buy meat.',
    details:
      'Docker (2013) revolutionized deployment by packaging code with all its dependencies into lightweight, portable containers — finally achieving true "build once, run anywhere." Google open-sourced Kubernetes in 2014, providing an orchestration layer to manage thousands of containers across clusters of machines. The microservices philosophy gave each service its own private database, ensuring that a failure in the payment system doesn\'t crash product browsing. AWS Lambda (2014) introduced serverless computing, where code runs only for the milliseconds it needs — no idle servers, no wasted resources. Today\'s frontier includes edge computing (running code at CDN nodes closest to users) and WebAssembly (running compiled code at near-native speed in browsers and servers). The trend continues toward ever-greater abstraction: from managing hardware, to managing VMs, to managing containers, and now to managing nothing at all.',
  },
];

const BackendEvolution: React.FC = () => {
  const [selectedEra, setSelectedEra] = useState<string>('foundations');
  const activeEra = eras.find((e) => e.id === selectedEra) || eras[0];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-zinc-50 rounded-2xl p-8 border border-slate-200 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Clock className="w-8 h-8 text-slate-600" />
          <h1 className="text-4xl font-bold text-gray-900">The Archeology of Logic</h1>
        </div>
        <p className="text-xl text-gray-700 leading-relaxed max-w-4xl">
          The history of backend development is a narrative of increasing abstraction — moving from
          the physical manipulation of hardware to the orchestration of ephemeral cloud resources.
        </p>
      </div>

      {/* Interactive Timeline */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Interactive Timeline</h2>

        {/* Timeline Navigation */}
        <div className="relative mb-8">
          {/* Connection Line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-gradient-to-r from-amber-300 via-emerald-300 to-slate-400 rounded-full"></div>

          <div className="relative flex justify-between">
            {eras.map((era) => (
              <button
                key={era.id}
                onClick={() => setSelectedEra(era.id)}
                className={`relative flex flex-col items-center transition-all duration-300 group ${
                  selectedEra === era.id ? 'scale-110 z-10' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    selectedEra === era.id
                      ? `${era.bgColor} ${era.borderColor} ${era.color} shadow-lg`
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {era.icon}
                </div>
                <span
                  className={`mt-2 text-xs font-semibold whitespace-nowrap ${
                    selectedEra === era.id ? era.color : 'text-gray-500'
                  }`}
                >
                  {era.years}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Era Detail */}
        <div
          className={`${activeEra.bgColor} ${activeEra.borderColor} border rounded-xl p-6 transition-all duration-500`}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div
              className={`w-10 h-10 rounded-full ${activeEra.bgColor} flex items-center justify-center ${activeEra.color}`}
            >
              {activeEra.icon}
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${activeEra.color}`}>{activeEra.title}</h3>
              <span className="text-sm text-gray-500">{activeEra.paradigm}</span>
            </div>
          </div>

          <p className="text-gray-700 mb-4 leading-relaxed">{activeEra.details}</p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Key Characteristics</h4>
              <ul className="space-y-2">
                {activeEra.characteristics.map((c, i) => (
                  <li key={i} className="flex items-start space-x-2 text-gray-700 text-sm">
                    <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${activeEra.bgColor} rounded-lg p-4 border ${activeEra.borderColor}`}>
              <h4 className="font-semibold text-gray-800 mb-2">💡 Analogy</h4>
              <p className="text-gray-700 text-sm italic">&ldquo;{activeEra.analogy}&rdquo;</p>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Evolution Summary Table */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Evolution at a Glance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Phase</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Characteristics</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Paradigm</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Analogy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {eras.map((era) => (
                <tr
                  key={era.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedEra(era.id)}
                >
                  <td className="py-3 px-4">
                    <div className={`font-semibold ${era.color}`}>{era.title}</div>
                    <div className="text-xs text-gray-500">{era.years}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{era.characteristics[0]}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`${era.bgColor} ${era.color} px-2 py-1 rounded text-xs font-medium`}
                    >
                      {era.paradigm}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 italic text-xs">{era.analogy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ThemeCard>
    </div>
  );
};

export default BackendEvolution;
