import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import DOMTreeVisualization from '../../components/models2d/react/DOMTreeVisualization';

const DOMFundamentals: React.FC = () => {
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">DOM Fundamentals</h1>
      <p className="text-xl text-gray-700">
        Understanding the Document Object Model that React builds upon
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* What is the DOM */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            🌳
          </div>
          <h2 className="text-2xl font-bold text-gray-900">What is the DOM?</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            The Document Object Model (DOM) is a fundamental programming interface for web
            documents. It is not a document itself, but rather an application programming interface
            (API) for HTML and XML documents that defines their logical structure and provides a
            method for accessing and manipulating them.
          </p>
          <p>
            For a novice, it can be helpful to view the DOM as a dynamic, living blueprint of a web
            page that the browser constructs. While a static HTML file serves as the initial plan
            for a page, the DOM is the active, in-memory representation of that page at any given
            moment.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-blue-800">
              <strong>Key Insight:</strong> The DOM represents the document as a collection of nodes
              and objects, allowing programming languages like JavaScript to interact with and
              change the structure, style, and content of the page.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Tree Structure */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          The Tree Structure: Nodes and Objects
        </h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            The DOM's logical structure is modeled as a tree, or more precisely, a "forest" that can
            contain multiple trees. This hierarchical structure is composed of various types of
            nodes, with every element, text, and attribute in the HTML document being represented as
            a node or a collection of nodes.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Node Types:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-green-600">Element Nodes</div>
                <div className="text-sm text-gray-600">HTML tags like &lt;div&gt;, &lt;p&gt;</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-blue-600">Text Nodes</div>
                <div className="text-sm text-gray-600">Content between tags</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-purple-600">Attribute Nodes</div>
                <div className="text-sm text-gray-600">Tag attributes like class, id</div>
              </div>
            </div>
          </div>

          <p className="text-gray-700">
            Every node type is an object in JavaScript, and this organization is made possible
            through a system of inheritance. A general Node type serves as a parent, and more
            specific types like Element and Text inherit its methods and properties.
          </p>
        </div>
      </ThemeCard>

      {/* Interactive DOM Tree Visualization */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Interactive DOM Tree Explorer</h3>
        <p className="text-gray-700 mb-4">
          Click on nodes in the tree below to explore how the DOM represents a web page structure.
          Each node shows its HTML tag, and indicators reveal which nodes contain content or
          attributes.
        </p>
        <DOMTreeVisualization className="mb-4" />
      </ThemeCard>

      {/* Browser Rendering Process */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">How the DOM Powers the Web</h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            The process begins when a web page is loaded. The browser takes the HTML document and
            parses it, constructing the hierarchical DOM tree in memory based on the document's
            structure.
          </p>

          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
            <p className="text-green-800">
              <strong>Browser Rendering Steps:</strong>
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-green-700">
              <li>Parse HTML → Construct DOM tree</li>
              <li>Parse CSS → Create CSSOM (CSS Object Model)</li>
              <li>Combine DOM + CSSOM → Create Render Tree</li>
              <li>Calculate layouts and positioning</li>
              <li>Paint pixels to screen</li>
            </ol>
          </div>

          <p className="text-gray-700">
            The DOM's true power lies in its API, which serves as the interface for JavaScript to
            interact with the browser. This API provides methods like getElementById, querySelector,
            and addEventListener that enable programmatic access to manipulate the document.
          </p>
        </div>
      </ThemeCard>

      {/* Performance Bottleneck */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">The Performance Bottleneck</h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            While the DOM API offers immense power, direct manipulation of the real DOM is a
            "laborious and slow operation". Any change, even a minor one, can trigger the browser to
            recalculate the layout and re-render large sections of the page, a process that is
            computationally expensive.
          </p>

          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <p className="text-red-800">
              <strong>The Problem:</strong> Traditional imperative approaches required developers to
              manually track and update DOM elements, leading to complex, error-prone code and
              unresponsive user interfaces.
            </p>
          </div>

          <p className="text-gray-700">
            This architectural limitation drove the creation of React - a library designed to solve
            the fundamental inefficiency of direct DOM manipulation through declarative programming
            and intelligent diffing algorithms.
          </p>
        </div>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <ThemeCard>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Key Concepts</h3>
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Tree Structure</p>
            <p className="text-xs text-gray-600">
              Hierarchical representation of document elements
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Node Types</p>
            <p className="text-xs text-gray-600">
              Elements, text, attributes as JavaScript objects
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Browser API</p>
            <p className="text-xs text-gray-600">
              Interface for JavaScript to manipulate documents
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Performance Cost</p>
            <p className="text-xs text-gray-600">Expensive layout recalculations and repaints</p>
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

export default DOMFundamentals;
