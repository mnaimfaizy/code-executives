import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import CTASection from '../../../../components/shared/CTASection';
import StreamsBuffersViz from '../visualizations/2d/StreamsBuffersViz';
import { Lightbulb } from 'lucide-react';

const BuffersStreams: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    window.location.href = '/nodejs?section=' + encodeURIComponent(sectionName);
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">🌊 Buffers &amp; Streams</h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        Buffers handle raw binary data, and Streams let you process data piece by piece instead of
        loading everything into memory. This is how Node.js processes a 10GB file using only 12MB of
        memory.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Water pipe analogy */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200 mb-8">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">The Water Pipe Analogy 🚿</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Imagine you need to move a swimming pool&apos;s worth of water. You have two options:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <p className="font-semibold text-red-800 text-sm">❌ Load All at Once</p>
                <p className="text-xs text-gray-600">
                  Get a giant truck, fill it with ALL the water, drive it over. Need a massive truck
                  (memory) and can&apos;t start until fully loaded.
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="font-semibold text-green-800 text-sm">✅ Stream with a Pipe</p>
                <p className="text-xs text-gray-600">
                  Connect a pipe. Water flows immediately, one bucket at a time. Uses minimal
                  resources and starts delivering instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Visualization */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Interactive Streaming Pipeline</h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Watch data flow through a streaming pipeline: from source to readable stream, through a
          transform, and into a writable destination — all while using minimal memory.
        </p>
        <StreamsBuffersViz />
      </ThemeCard>

      {/* Buffers */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📦 Buffers: Raw Binary Data</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          A Buffer is a fixed-size chunk of memory allocated outside the V8 heap. It stores raw
          binary data — bytes that represent files, network packets, images, or any other binary
          content.
        </p>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-semibold text-green-400 mb-3">Creating Buffers</h4>
            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">{`// From string
const buf1 = Buffer.from('Hello');
// <Buffer 48 65 6c 6c 6f>

// Allocate safe (zeroed)
const buf2 = Buffer.alloc(10);

// From array
const buf3 = Buffer.from([72, 101, 108]);

// Convert back
buf1.toString('utf8'); // 'Hello'
buf1.toString('base64'); // 'SGVsbG8='`}</pre>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Key Buffer Facts</h4>
            <ul className="text-sm text-gray-700 space-y-3">
              <li>
                📏 <strong>Fixed size</strong> — once allocated, cannot be resized
              </li>
              <li>
                🧠 <strong>Outside V8 heap</strong> — allocated in C++ memory
              </li>
              <li>
                ⚡ <strong>Fast I/O</strong> — maps directly to system memory
              </li>
              <li>
                🔢 <strong>Byte arrays</strong> — each element is 0-255
              </li>
              <li>
                ⚠️ <strong>Buffer.allocUnsafe()</strong> — faster but may contain old data
              </li>
            </ul>
          </div>
        </div>
      </ThemeCard>

      {/* Stream Types */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🌊 The 4 Types of Streams</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              type: 'Readable',
              desc: 'Stream you can read data from',
              examples: 'fs.createReadStream, http.IncomingMessage, process.stdin',
              icon: '📖',
              color: 'blue',
            },
            {
              type: 'Writable',
              desc: 'Stream you can write data to',
              examples: 'fs.createWriteStream, http.ServerResponse, process.stdout',
              icon: '✍️',
              color: 'green',
            },
            {
              type: 'Duplex',
              desc: 'Both readable and writable (independently)',
              examples: 'net.Socket, TCP connections',
              icon: '🔄',
              color: 'purple',
            },
            {
              type: 'Transform',
              desc: 'Duplex stream that modifies data as it passes through',
              examples: 'zlib.createGzip, crypto.createCipher',
              icon: '🔀',
              color: 'amber',
            },
          ].map((stream) => (
            <div
              key={stream.type}
              className={`bg-gradient-to-r from-${stream.color}-50 to-white rounded-xl p-5 border border-${stream.color}-200`}
            >
              <h3 className={`text-lg font-semibold text-${stream.color}-800 mb-2`}>
                {stream.icon} {stream.type} Stream
              </h3>
              <p className="text-gray-700 text-sm mb-2">{stream.desc}</p>
              <p className="text-xs text-gray-500 italic">Examples: {stream.examples}</p>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Backpressure */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🛑 Backpressure: Don&apos;t Flood the Pipe
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          When a readable stream produces data faster than the writable stream can consume it, data
          accumulates in memory. This is <strong>backpressure</strong>.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-red-50 rounded-xl p-5 border border-red-200">
            <h4 className="font-semibold text-red-800 mb-3">❌ Without .pipe() — Memory Leak!</h4>
            <div className="bg-gray-900 rounded-lg p-3 border border-red-700/30">
              <pre className="text-xs text-red-400 font-mono whitespace-pre-wrap">{`// BAD: Ignores backpressure
readable.on('data', (chunk) => {
  writable.write(chunk);
  // If writable is slow, data
  // accumulates in memory! 💥
});`}</pre>
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-3">✅ With .pipe() — Auto-managed</h4>
            <div className="bg-gray-900 rounded-lg p-3 border border-green-700/30">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{`// GOOD: pipe() handles backpressure
readable.pipe(transform).pipe(writable);

// Or use pipeline() for error handling
const { pipeline } = require('stream');
pipeline(readable, transform, writable,
  (err) => { /* cleanup */ });`}</pre>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  return (
    <>
      <SectionLayout section="nodejs" hero={heroContent} mainContent={mainContent} />
      <CTASection
        title="Next: Scaling Node.js"
        description="Learn how to use all CPU cores with Clustering and Worker Threads."
        buttonText="Continue to Scaling →"
        onButtonClick={() => navigateToSection('Scaling')}
        colorScheme="green"
      />
    </>
  );
};

export default BuffersStreams;
