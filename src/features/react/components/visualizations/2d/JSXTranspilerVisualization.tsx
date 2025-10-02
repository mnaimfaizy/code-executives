import React, { useState, useMemo } from 'react';

interface JSXExample {
  name: string;
  jsx: string;
  description: string;
}

const JSXTranspilerVisualization: React.FC = () => {
  const [selectedExample, setSelectedExample] = useState(0);
  const [showCompiled, setShowCompiled] = useState(false);

  const examples = useMemo<JSXExample[]>(
    () => [
      {
        name: 'Simple Element',
        jsx: `<div className="greeting">\n  <h1>Hello, World!</h1>\n  <p>Welcome to React</p>\n</div>`,
        description: 'Basic JSX element with nested children',
      },
      {
        name: 'With Expressions',
        jsx: `const name = "React";\nconst element = (\n  <div>\n    <h1>Hello, {name}!</h1>\n    <p>Count: {2 + 2}</p>\n  </div>\n);`,
        description: 'JSX with embedded JavaScript expressions',
      },
      {
        name: 'Component Usage',
        jsx: `function Welcome(props) {\n  return <h1>Hello, {props.name}!</h1>;\n}\n\nconst element = <Welcome name="Sara" />;`,
        description: 'Using custom components with props',
      },
      {
        name: 'Conditional Rendering',
        jsx: `const isLoggedIn = true;\nconst element = (\n  <div>\n    {isLoggedIn ? (\n      <h1>Welcome back!</h1>\n    ) : (\n      <h1>Please sign in.</h1>\n    )}\n  </div>\n);`,
        description: 'Conditional rendering with ternary operators',
      },
      {
        name: 'Lists and Keys',
        jsx: `const numbers = [1, 2, 3, 4, 5];\nconst listItems = numbers.map((number) =>\n  <li key={number.toString()}>\n    {number}\n  </li>\n);\n\nconst element = <ul>{listItems}</ul>;`,
        description: 'Rendering lists with unique keys',
      },
    ],
    []
  );

  const compiledJS = useMemo(() => {
    const jsx = examples[selectedExample].jsx;
    // Simple JSX to React.createElement conversion (simplified)
    return jsx
      .replace(/<(\w+)([^>]*)>(.*?)<\/\1>/gs, (_, tag, attrs, content) => {
        const attrString = attrs.trim();
        const attrObj = attrString
          ? `{${attrString.replace(/(\w+)="([^"]*)"/g, '$1: "$2"').replace(/(\w+)=\{([^}]*)\}/g, '$1: $2')}}`
          : 'null';
        const childContent = content.trim()
          ? content
              .trim()
              .split('\n')
              .map((line: string) => line.trim())
              .filter((line: string) => line)
              .join(', ')
          : '';
        return `React.createElement("${tag}", ${attrObj}${childContent ? `, ${childContent}` : ''})`;
      })
      .replace(/<(\w+)([^>]*)\/>/g, (_, tag, attrs) => {
        const attrString = attrs.trim();
        const attrObj = attrString
          ? `{${attrString.replace(/(\w+)="([^"]*)"/g, '$1: "$2"').replace(/(\w+)=\{([^}]*)\}/g, '$1: $2')}}`
          : 'null';
        return `React.createElement("${tag}", ${attrObj})`;
      })
      .replace(/{(\w+)}/g, '$1')
      .replace(/{([^}]+)}/g, '$1');
  }, [selectedExample, examples]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Interactive JSX Transpiler</h3>
        <p className="text-gray-700 mb-4">
          See how JSX gets compiled to React.createElement calls. JSX is just syntactic sugar!
        </p>

        {/* Example Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => setSelectedExample(index)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedExample === index
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {example.name}
            </button>
          ))}
        </div>

        {/* Toggle Compiled View */}
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showCompiled}
              onChange={(e) => setShowCompiled(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Show compiled JavaScript</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* JSX Source */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">JSX Source Code</h4>
            <p className="text-sm text-gray-600 mb-3">{examples[selectedExample].description}</p>
            <div className="bg-white p-4 rounded border font-mono text-sm text-gray-900 overflow-x-auto">
              <pre className="whitespace-pre-wrap">{examples[selectedExample].jsx}</pre>
            </div>
          </div>

          {/* JSX Rules */}
          <div className="p-4 bg-pink-50 rounded-lg">
            <h5 className="font-semibold text-pink-900 mb-3">JSX Rules</h5>
            <ul className="text-sm text-pink-800 space-y-2">
              <li>• Return single root element</li>
              <li>• Use className instead of class</li>
              <li>• Use camelCase for attributes</li>
              <li>• Close all tags properly</li>
              <li>• Embed JS in curly braces {'{}'}</li>
            </ul>
          </div>
        </div>

        {/* Compiled Output */}
        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg transition-all duration-300 ${
              showCompiled
                ? 'bg-blue-50 border-2 border-blue-200'
                : 'bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <h4 className="font-semibold text-gray-900 mb-2">
              {showCompiled ? 'Compiled JavaScript' : 'What JSX Really Is'}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {showCompiled
                ? 'This is the actual JavaScript that gets executed'
                : 'JSX gets compiled to React.createElement calls'}
            </p>
            <div
              className={`p-4 rounded border font-mono text-sm overflow-x-auto transition-all duration-300 ${
                showCompiled ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {showCompiled ? (
                <pre className="whitespace-pre-wrap">{compiledJS}</pre>
              ) : (
                <div className="space-y-2">
                  <div className="text-center text-4xl mb-4">⚛️</div>
                  <p className="text-center text-lg font-semibold">JSX</p>
                  <div className="flex justify-center">
                    <div className="text-2xl">⬇️</div>
                  </div>
                  <p className="text-center text-lg font-semibold">React.createElement()</p>
                  <div className="text-center text-sm text-gray-600 mt-2">
                    Babel/Webpack compiles JSX to function calls
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Compilation Process */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h5 className="font-semibold text-green-900 mb-3">Compilation Process</h5>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-green-900 text-sm">Write JSX</p>
                  <p className="text-xs text-green-700">HTML-like syntax in JS files</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-blue-900 text-sm">Babel Transpiles</p>
                  <p className="text-xs text-blue-700">Converts JSX to React.createElement</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-purple-900 text-sm">React Renders</p>
                  <p className="text-xs text-purple-700">Creates virtual DOM elements</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Takeaway */}
      <div className="mt-6 p-4 bg-pink-50 border border-pink-200 rounded-lg">
        <h5 className="font-semibold text-pink-900 mb-2">💡 Key Takeaway</h5>
        <p className="text-pink-800 text-sm">
          JSX is not HTML in JavaScript - it's a syntax that gets compiled to JavaScript. The
          browser never sees JSX; it only executes the compiled React.createElement calls. This is
          why JSX can have JavaScript expressions but HTML cannot.
        </p>
      </div>
    </div>
  );
};

export default JSXTranspilerVisualization;
