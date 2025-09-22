import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import JSXTranspilerVisualization from '../../components/models2d/react/JSXTranspilerVisualization';

const JSX: React.FC = () => {
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">JSX</h1>
      <p className="text-xl text-gray-700">JavaScript XML - Writing HTML in JavaScript</p>
    </div>
  );

  const mainContent = (
    <>
      {/* What is JSX */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center mr-3">
            ⚛️
          </div>
          <h2 className="text-2xl font-bold text-gray-900">JSX: JavaScript Syntax Extension</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            JSX is a syntax extension for JavaScript that allows you to write HTML-like code
            directly in your JavaScript files. It was created by Facebook as part of React to make
            component creation more intuitive and readable.
          </p>
          <p>
            JSX gets compiled to regular JavaScript function calls and objects, so it doesn't change
            the fundamental nature of JavaScript - it's just syntactic sugar that makes React code
            more expressive.
          </p>
          <div className="bg-pink-50 border-l-4 border-pink-400 p-4 rounded-r-lg">
            <p className="text-pink-800">
              <strong>JSX Philosophy:</strong> "Write code that looks like what it renders" - JSX
              makes your components self-documenting by showing the UI structure directly in the
              code.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* JSX Basics */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">JSX Basics: HTML in JavaScript</h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            JSX looks like HTML but follows JavaScript rules. You can embed JavaScript expressions
            using curly braces, and you must follow XML rules for element structure.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">JSX Syntax</h4>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono text-gray-900">
                const element = (<br />
                &nbsp;&nbsp;&lt;div className="greeting"&gt;
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&lt;h1&gt;Hello, world!&lt;/h1&gt;
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&lt;p&gt;Welcome to React&lt;/p&gt;
                <br />
                &nbsp;&nbsp;&lt;/div&gt;
                <br />
                );
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3">Compiled JavaScript</h4>
              <div className="bg-blue-100 p-3 rounded text-sm font-mono text-blue-900">
                const element = React.createElement(
                <br />
                &nbsp;&nbsp;"div",
                <br />
                &nbsp;&nbsp;{'{'}className: "greeting"{'}'},<br />
                &nbsp;&nbsp;React.createElement("h1", null, "Hello, world!"),
                <br />
                &nbsp;&nbsp;React.createElement("p", null, "Welcome to React")
                <br />
                );
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Embedding Expressions */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Embedding JavaScript Expressions</h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            JSX allows you to embed any valid JavaScript expression within curly braces. This
            includes variables, function calls, arithmetic operations, and more.
          </p>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Expression Examples</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-100 p-3 rounded text-sm font-mono text-green-900">
                  const name = "React";
                  <br />
                  &lt;p&gt;Hello, {'{'}name{'}'}!&lt;/p&gt;
                </div>
                <div className="bg-green-100 p-3 rounded text-sm font-mono text-green-900">
                  const user = {'{'} name: "John" {'}'};<br />
                  &lt;p&gt;Hello, {'{'}user.name{'}'}!&lt;/p&gt;
                </div>
                <div className="bg-green-100 p-3 rounded text-sm font-mono text-green-900">
                  const count = 5;
                  <br />
                  &lt;p&gt;You have {'{'}count * 2{'}'} messages&lt;/p&gt;
                </div>
                <div className="bg-green-100 p-3 rounded text-sm font-mono text-green-900">
                  &lt;p&gt;Status: {'{'}isOnline ? "Online" : "Offline"{'}'}&lt;/p&gt;
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <p className="text-yellow-800">
                <strong>Important:</strong> Expressions in JSX produce values. They don't execute
                arbitrary JavaScript statements. You can't use if/else statements directly in JSX -
                use ternary operators or move logic outside the JSX.
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* JSX Attributes */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">JSX Attributes and Props</h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            JSX attributes work similarly to HTML attributes, but with some important differences
            due to JavaScript integration and React conventions.
          </p>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-sm">HTML</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">HTML Attributes</p>
                <p className="text-gray-600 text-sm">
                  Use kebab-case: <code className="bg-gray-100 px-1 rounded">onclick</code>,
                  <code className="bg-gray-100 px-1 rounded">background-color</code>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 font-bold text-sm">JSX</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">JSX Attributes</p>
                <p className="text-gray-600 text-sm">
                  Use camelCase: <code className="bg-gray-100 px-1 rounded">onClick</code>,
                  <code className="bg-gray-100 px-1 rounded">backgroundColor</code>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="font-semibold text-indigo-800 mb-2">Common JSX Attributes</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="bg-indigo-100 p-2 rounded text-indigo-900 text-center">className</div>
              <div className="bg-indigo-100 p-2 rounded text-indigo-900 text-center">onClick</div>
              <div className="bg-indigo-100 p-2 rounded text-indigo-900 text-center">onChange</div>
              <div className="bg-indigo-100 p-2 rounded text-indigo-900 text-center">disabled</div>
              <div className="bg-indigo-100 p-2 rounded text-indigo-900 text-center">style</div>
              <div className="bg-indigo-100 p-2 rounded text-indigo-900 text-center">key</div>
              <div className="bg-indigo-100 p-2 rounded text-indigo-900 text-center">ref</div>
              <div className="bg-indigo-100 p-2 rounded text-indigo-900 text-center">children</div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* JSX Best Practices */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">JSX Best Practices and Patterns</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-800">✅ Recommended Patterns</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Use self-closing tags for empty elements</li>
                <li>• Wrap multiline JSX in parentheses</li>
                <li>• Use meaningful variable names</li>
                <li>• Extract complex JSX into components</li>
                <li>• Use fragments for multiple root elements</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-red-800">❌ Common Mistakes</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Forgetting to close tags</li>
                <li>• Using class instead of className</li>
                <li>• Not wrapping expressions in curly braces</li>
                <li>• Using JavaScript reserved words as attributes</li>
                <li>• Not escaping special characters</li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
            <h4 className="font-semibold text-purple-800 mb-2">Fragments for Multiple Roots</h4>
            <p className="text-purple-700 mb-2">
              When a component needs to return multiple elements, use React.Fragment to avoid
              unnecessary wrapper divs:
            </p>
            <div className="bg-purple-100 p-3 rounded text-sm font-mono text-purple-900">
              return (<br />
              &nbsp;&nbsp;&lt;React.Fragment&gt;
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&lt;h1&gt;Title&lt;/h1&gt;
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&lt;p&gt;Description&lt;/p&gt;
              <br />
              &nbsp;&nbsp;&lt;/React.Fragment&gt;
              <br />
              );
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* JSX and Tooling */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">JSX Tooling and Compilation</h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            JSX requires compilation to work in browsers. Modern React projects use build tools like
            Vite, Create React App, or Next.js that handle JSX compilation automatically.
          </p>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700">
                <strong>Babel:</strong> Transforms JSX to JavaScript during build
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700">
                <strong>TypeScript:</strong> Provides type checking for JSX
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-400 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700">
                <strong>ESLint:</strong> Lints JSX for best practices
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-orange-400 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700">
                <strong>Prettier:</strong> Formats JSX consistently
              </span>
            </div>
          </div>

          <p className="text-gray-700">
            The JSX compilation process is completely transparent to developers - you write JSX, and
            the build tools handle the transformation to browser-compatible JavaScript.
          </p>
        </div>
      </ThemeCard>

      {/* Interactive JSX Transpiler Visualization */}
      <ThemeCard>
        <JSXTranspilerVisualization />
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <ThemeCard>
      <h3 className="text-lg font-bold text-gray-900 mb-4">JSX Essentials</h3>
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Syntax Extension</p>
            <p className="text-xs text-gray-600">HTML-like syntax in JS</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Expressions</p>
            <p className="text-xs text-gray-600">JavaScript in curly braces</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Attributes</p>
            <p className="text-xs text-gray-600">camelCase instead of kebab-case</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Compilation</p>
            <p className="text-xs text-gray-600">Babel transforms to JS</p>
          </div>
        </div>
      </div>
    </ThemeCard>
  );

  return (
    <SectionLayout
      section="react"
      hero={heroContent}
      mainContent={mainContent}
      sidebar={sidebarContent}
    />
  );
};

export default JSX;
