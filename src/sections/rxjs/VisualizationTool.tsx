import React, { useState, useCallback, useMemo } from 'react';

// Type definitions
interface StreamEvent {
  type: 'next' | 'complete' | 'error';
  time: number;
  value: string | null;
}

const VisualizationTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState('editor');
  const [marbleSequence, setMarbleSequence] = useState('--a--b--c--|');
  const [selectedOperator, setSelectedOperator] = useState('map');
  const [operatorConfig, setOperatorConfig] = useState('x => x.toUpperCase()');

  // Marble diagram parser
  const parseMarbleSequence = useCallback((sequence: string): StreamEvent[] => {
    const events: StreamEvent[] = [];
    let time = 0;

    for (let i = 0; i < sequence.length; i++) {
      const char = sequence[i];

      if (char === '-') {
        time += 10;
      } else if (char === '|') {
        events.push({ type: 'complete', time, value: null });
        break;
      } else if (char === '#') {
        events.push({ type: 'error', time, value: 'Error' });
        break;
      } else if (char !== ' ') {
        events.push({ type: 'next', time, value: char });
        time += 10;
      }
    }

    return events;
  }, []);

  // Apply operator simulation
  const applyOperator = useCallback((events: StreamEvent[], operator: string, config: string) => {
    switch (operator) {
      case 'map':
        return events.map((event) => {
          if (event.type === 'next') {
            try {
              const transform = new Function('x', `return ${config}`);
              return { ...event, value: transform(event.value) };
            } catch {
              return { ...event, value: `map(${event.value})` };
            }
          }
          return event;
        });

      case 'filter':
        return events.filter((event) => {
          if (event.type === 'next') {
            try {
              const predicate = new Function('x', `return ${config}`);
              return predicate(event.value);
            } catch {
              return true;
            }
          }
          return true;
        });

      case 'delay': {
        const delayAmount = parseInt(config) || 30;
        return events.map((event) => ({
          ...event,
          time: event.time + delayAmount,
        }));
      }

      case 'take': {
        const takeCount = parseInt(config) || 2;
        let count = 0;
        const result: StreamEvent[] = [];
        for (const event of events) {
          if (event.type === 'next') {
            if (count < takeCount) {
              result.push(event);
              count++;
            }
            if (count >= takeCount) {
              result.push({ type: 'complete' as const, time: event.time + 10, value: null });
              break;
            }
          } else {
            result.push(event);
          }
        }
        return result;
      }

      default:
        return events;
    }
  }, []);

  const sourceEvents = useMemo(
    () => parseMarbleSequence(marbleSequence),
    [marbleSequence, parseMarbleSequence]
  );
  const transformedEvents = useMemo(
    () => applyOperator(sourceEvents, selectedOperator, operatorConfig),
    [sourceEvents, selectedOperator, operatorConfig, applyOperator]
  );

  return (
    <section className="mb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-violet-50 via-white to-purple-50 rounded-2xl p-8 mb-8 border border-violet-100 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">RxJS Visualization Tool</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Interactive marble diagram editor and operator playground for hands-on learning
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* Tool Navigation */}
        <div className="mb-8">
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            <div className="flex flex-wrap justify-center mb-8 border-b border-gray-200">
              {[
                { id: 'editor', label: 'Marble Editor', icon: '✏️', color: 'purple' },
                { id: 'operators', label: 'Operator Playground', icon: '⚡', color: 'blue' },
                { id: 'timeline', label: 'Timeline Visualizer', icon: '📊', color: 'green' },
                { id: 'examples', label: 'Interactive Examples', icon: '🎮', color: 'orange' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? `border-${tab.color}-500 text-${tab.color}-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="max-w-5xl mx-auto">
              {activeTab === 'editor' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Interactive Marble Diagram Editor
                    </h3>
                    <p className="text-gray-600">
                      Create and visualize your own marble diagrams in real-time
                    </p>
                  </div>

                  {/* Marble Editor */}
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Marble Sequence Editor</h4>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Marble Sequence
                        </label>
                        <input
                          type="text"
                          value={marbleSequence}
                          onChange={(e) => setMarbleSequence(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg font-mono text-lg"
                          placeholder="--a--b--c--|"
                        />
                        <div className="mt-2 text-sm text-gray-500">
                          <p>
                            <strong>Syntax:</strong>
                          </p>
                          <ul className="mt-1 space-y-1">
                            <li>
                              • <code>-</code> = 10ms time unit
                            </li>
                            <li>
                              • <code>a,b,c</code> = values
                            </li>
                            <li>
                              • <code>|</code> = completion
                            </li>
                            <li>
                              • <code>#</code> = error
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-lg font-semibold text-gray-900 mb-3">Visual Preview</h5>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <MarbleDiagramVisualization events={sourceEvents} title="Source Stream" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Templates */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Quick Templates</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { name: 'Simple', sequence: '--a--b--c--|' },
                        { name: 'Fast', sequence: '-a-b-c-d-e|' },
                        { name: 'Delayed', sequence: '----a----b----c|' },
                        { name: 'With Error', sequence: '--a--b--#' },
                        { name: 'Burst', sequence: '-abc----def|' },
                        { name: 'Empty', sequence: '------|' },
                        { name: 'Never', sequence: '------' },
                        { name: 'Immediate', sequence: 'a|' },
                      ].map((template) => (
                        <button
                          key={template.name}
                          onClick={() => setMarbleSequence(template.sequence)}
                          className="p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 transition-colors text-left"
                        >
                          <div className="font-semibold text-blue-900 mb-1">{template.name}</div>
                          <div className="font-mono text-sm text-blue-600">{template.sequence}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Marble Syntax Guide */}
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Marble Diagram Syntax Guide
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold text-green-800 mb-3">Time & Values</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-3">
                            <code className="bg-white px-2 py-1 rounded border">-</code>
                            <span>Time unit (10ms)</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <code className="bg-white px-2 py-1 rounded border">a</code>
                            <span>Emitted value</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <code className="bg-white px-2 py-1 rounded border">(ab)</code>
                            <span>Synchronous values</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <code className="bg-white px-2 py-1 rounded border">^</code>
                            <span>Subscription point</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-semibold text-green-800 mb-3">Completion & Errors</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-3">
                            <code className="bg-white px-2 py-1 rounded border">|</code>
                            <span>Successful completion</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <code className="bg-white px-2 py-1 rounded border">#</code>
                            <span>Error termination</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <code className="bg-white px-2 py-1 rounded border">!</code>
                            <span>Unsubscription</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <code className="bg-white px-2 py-1 rounded border">...</code>
                            <span>Continues indefinitely</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'operators' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Operator Playground</h3>
                    <p className="text-gray-600">
                      See how operators transform your streams in real-time
                    </p>
                  </div>

                  {/* Operator Configuration */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Operator Configuration</h4>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Operator
                        </label>
                        <select
                          value={selectedOperator}
                          onChange={(e) => setSelectedOperator(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        >
                          <optgroup label="Transformation">
                            <option value="map">map</option>
                            <option value="scan">scan</option>
                            <option value="buffer">buffer</option>
                          </optgroup>
                          <optgroup label="Filtering">
                            <option value="filter">filter</option>
                            <option value="take">take</option>
                            <option value="skip">skip</option>
                            <option value="distinct">distinct</option>
                          </optgroup>
                          <optgroup label="Timing">
                            <option value="delay">delay</option>
                            <option value="throttle">throttle</option>
                            <option value="debounce">debounce</option>
                          </optgroup>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Configuration
                        </label>
                        <input
                          type="text"
                          value={operatorConfig}
                          onChange={(e) => setOperatorConfig(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg font-mono"
                          placeholder="x => x.toUpperCase()"
                        />
                        <div className="mt-2 text-sm text-gray-500">
                          {getOperatorHelp(selectedOperator)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stream Visualization */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Stream Transformation</h4>

                    <div className="space-y-6">
                      {/* Input Stream */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-lg font-semibold text-gray-900">Source Stream</h5>
                          <input
                            type="text"
                            value={marbleSequence}
                            onChange={(e) => setMarbleSequence(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded font-mono text-sm"
                            placeholder="--a--b--c--|"
                          />
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <MarbleDiagramVisualization events={sourceEvents} title="source$" />
                        </div>
                      </div>

                      {/* Operator */}
                      <div className="flex items-center justify-center">
                        <div className="bg-blue-100 rounded-lg px-4 py-2 border border-blue-200">
                          <code className="text-blue-800 font-semibold">
                            .{selectedOperator}({operatorConfig})
                          </code>
                        </div>
                      </div>

                      {/* Output Stream */}
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900 mb-3">
                          Transformed Stream
                        </h5>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <MarbleDiagramVisualization events={transformedEvents} title="result$" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operator Examples */}
                  <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Common Operator Combinations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        {
                          name: 'Search Debouncing',
                          sequence: '--a-b-c---d-e|',
                          operators: ['debounceTime(300)', 'distinctUntilChanged()'],
                        },
                        {
                          name: 'Rate Limiting',
                          sequence: '-a-b-c-d-e-f|',
                          operators: ['throttleTime(100)', 'take(3)'],
                        },
                        {
                          name: 'Data Transformation',
                          sequence: '--1--2--3--|',
                          operators: ['map(x => x * 2)', 'filter(x => x > 2)'],
                        },
                        {
                          name: 'Error Recovery',
                          sequence: '--a--b--#',
                          operators: ['retry(2)', 'catchError(() => of("fallback"))'],
                        },
                      ].map((example, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-4 border border-yellow-200"
                        >
                          <h6 className="font-semibold text-yellow-800 mb-2">{example.name}</h6>
                          <div className="space-y-2">
                            <div className="font-mono text-sm text-gray-600">
                              {example.sequence}
                            </div>
                            {example.operators.map((op, opIndex) => (
                              <div key={opIndex} className="font-mono text-xs text-blue-600">
                                .{op}
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => {
                              setMarbleSequence(example.sequence);
                              // Set first operator for demo
                              const firstOp = example.operators[0].split('(')[0];
                              setSelectedOperator(firstOp);
                            }}
                            className="mt-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-300 transition-colors"
                          >
                            Try This
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Timeline Visualizer</h3>
                    <p className="text-gray-600">
                      See how events flow through time with animated timelines
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Timeline Animation</h4>

                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <TimelineVisualization
                        sourceEvents={sourceEvents}
                        transformedEvents={transformedEvents}
                        operator={selectedOperator}
                      />
                    </div>

                    <div className="mt-4 flex justify-center space-x-4">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        ▶️ Play Animation
                      </button>
                      <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                        ⏸️ Pause
                      </button>
                      <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                        🔄 Restart
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'examples' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Interactive Examples</h3>
                    <p className="text-gray-600">
                      Hands-on examples you can modify and experiment with
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Example 1: Mouse Events */}
                    <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">
                        🖱️ Mouse Event Stream
                      </h4>
                      <div className="bg-white rounded-lg p-4 border border-orange-200 mb-4">
                        <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                          <span className="text-gray-600">Move mouse here to generate events</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">Generated marble diagram:</div>
                      <div className="font-mono text-sm bg-white p-2 rounded border">
                        --m--m-----m-m-m--|
                      </div>
                    </div>

                    {/* Example 2: Button Clicks */}
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">🔘 Click Stream</h4>
                      <div className="bg-white rounded-lg p-4 border border-blue-200 mb-4">
                        <button className="w-full py-8 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors text-blue-800 font-semibold">
                          Click Me!
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Click events with throttling:
                      </div>
                      <div className="font-mono text-sm bg-white p-2 rounded border">
                        --c-----c-----c--|
                      </div>
                    </div>

                    {/* Example 3: Input Stream */}
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">⌨️ Input Stream</h4>
                      <div className="bg-white rounded-lg p-4 border border-purple-200 mb-4">
                        <input
                          type="text"
                          placeholder="Type here..."
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="text-sm text-gray-600 mb-2">Debounced input stream:</div>
                      <div className="font-mono text-sm bg-white p-2 rounded border">
                        ----h----he----hel--|
                      </div>
                    </div>

                    {/* Example 4: Timer */}
                    <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">⏰ Timer Stream</h4>
                      <div className="bg-white rounded-lg p-4 border border-red-200 mb-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600 mb-2">0</div>
                          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                            Start Timer
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">Interval stream:</div>
                      <div className="font-mono text-sm bg-white p-2 rounded border">
                        --0--1--2--3--4--|
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Learning Resources */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Interactive Learning Resources
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Resource 1 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Practice Mode</h3>
              <p className="text-gray-600 text-sm mb-4">
                Interactive challenges to test your understanding of marble diagrams and operators.
              </p>
              <button className="text-violet-600 hover:text-violet-800 font-semibold text-sm">
                Coming Soon →
              </button>
            </div>

            {/* Resource 2 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Code Generator</h3>
              <p className="text-gray-600 text-sm mb-4">
                Generate RxJS code from your marble diagrams and operator configurations
                automatically.
              </p>
              <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                Coming Soon →
              </button>
            </div>

            {/* Resource 3 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Testing Simulator</h3>
              <p className="text-gray-600 text-sm mb-4">
                Learn to write marble tests for your RxJS code with our interactive testing
                environment.
              </p>
              <button className="text-green-600 hover:text-green-800 font-semibold text-sm">
                Coming Soon →
              </button>
            </div>
          </div>
        </div>

        {/* Course Completion */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">🎉 Congratulations! RxJS Mastery Complete!</h2>
          <p className="text-violet-100 mb-6 max-w-3xl mx-auto">
            You've completed the comprehensive RxJS learning journey! From basic concepts to
            advanced patterns, error handling to real-world applications, and now interactive
            visualization tools. You're ready to build reactive applications with confidence!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                const baseUrl = '/rxjs?section=';
                const encodedSection = encodeURIComponent('Introduction');
                window.location.href = baseUrl + encodedSection;
              }}
              className="bg-white text-violet-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Review Course</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Explore More Topics</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Helper Components
const MarbleDiagramVisualization: React.FC<{ events: StreamEvent[]; title: string }> = ({
  events,
  title,
}) => {
  const maxTime = Math.max(...events.map((e) => e.time), 100);

  return (
    <div className="py-4">
      <div className="text-sm font-medium text-gray-700 mb-2">{title}</div>
      <div className="relative">
        {/* Timeline */}
        <div className="h-8 bg-gray-200 rounded-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-20"></div>

          {/* Events */}
          {events.map((event, index) => (
            <div
              key={index}
              className={`absolute top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                event.type === 'next'
                  ? 'bg-blue-500 text-white'
                  : event.type === 'complete'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
              }`}
              style={{ left: `${(event.time / maxTime) * 100}%` }}
              title={`Time: ${event.time}ms, Value: ${event.value || event.type}`}
            >
              {event.type === 'next' ? event.value : event.type === 'complete' ? '|' : '#'}
            </div>
          ))}
        </div>

        {/* Time markers */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0ms</span>
          <span>{maxTime}ms</span>
        </div>
      </div>
    </div>
  );
};

const TimelineVisualization: React.FC<{
  sourceEvents: StreamEvent[];
  transformedEvents: StreamEvent[];
  operator: string;
}> = ({ sourceEvents, transformedEvents, operator }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h5 className="text-lg font-semibold text-gray-900 mb-4">Stream Processing Timeline</h5>
      </div>

      <div className="space-y-4">
        <MarbleDiagramVisualization events={sourceEvents} title="📥 Input Stream" />

        <div className="flex items-center justify-center py-2">
          <div className="bg-blue-100 rounded-lg px-4 py-2 border border-blue-200">
            <span className="text-blue-800 font-mono font-semibold">.{operator}()</span>
          </div>
        </div>

        <MarbleDiagramVisualization events={transformedEvents} title="📤 Output Stream" />
      </div>
    </div>
  );
};

// Helper function for operator help text
const getOperatorHelp = (operator: string): string => {
  const helpTexts: Record<string, string> = {
    map: 'Transform function: x => newValue',
    filter: 'Predicate function: x => boolean',
    take: 'Number of items to take: number',
    delay: 'Delay in milliseconds: number',
    scan: 'Accumulator function: (acc, x) => newAcc',
  };

  return helpTexts[operator] || 'Configuration depends on selected operator';
};

export default VisualizationTool;
