import React, { useState } from 'react';
import { FileText, Folder, GitCommit, Tag, Hash, ArrowRight, Key, Database } from 'lucide-react';
import ObjectModel2D from '../../components/models2d/git/ObjectModel2D';

const ObjectModel: React.FC = () => {
  const [selectedObject, setSelectedObject] = useState<string>('blob');

  const gitObjects = [
    {
      type: 'blob',
      name: 'Blob',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      description: 'Stores file content',
      content: 'Raw file data',
      example: 'hello world\n',
      sha: 'ce013625030ba8dba906f756967f9e9ca394464a',
    },
    {
      type: 'tree',
      name: 'Tree',
      icon: <Folder className="w-6 h-6" />,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      borderColor: 'border-green-300',
      description: 'Stores directory structure',
      content: 'References to blobs and other trees',
      example: '100644 blob ce01362... hello.txt\n040000 tree 4b825dc... src/',
      sha: '4b825dc642cb6eb9a060e54bf8d69288fbee4904',
    },
    {
      type: 'commit',
      name: 'Commit',
      icon: <GitCommit className="w-6 h-6" />,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      description: 'Stores commit metadata',
      content: 'Tree reference, parents, author, message',
      example: 'tree 4b825dc...\nauthor John Doe <john@example.com>\ncommit message',
      sha: 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3',
    },
    {
      type: 'tag',
      name: 'Tag',
      icon: <Tag className="w-6 h-6" />,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      borderColor: 'border-purple-300',
      description: 'Stores tag information',
      content: 'Object reference, tagger, message',
      example: 'object a94a8fe...\ntag v1.0.0\ntagger John Doe\nRelease v1.0.0',
      sha: 'f7c3bc1d808e04732adf1059c9e3d6fe2fa81a0a',
    },
  ];

  const hashingSteps = [
    {
      step: 1,
      title: 'Content Preparation',
      description: 'Add object type and size header to content',
      example: 'blob 12\0hello world\n',
    },
    {
      step: 2,
      title: 'SHA-1 Hashing',
      description: 'Apply SHA-1 cryptographic hash function',
      example: 'SHA-1(blob 12\0hello world\n)',
    },
    {
      step: 3,
      title: 'Object ID Generated',
      description: '40-character hexadecimal identifier',
      example: 'ce013625030ba8dba906f756967f9e9ca394464a',
    },
  ];

  const selectedObjectData = gitObjects.find((obj) => obj.type === selectedObject);

  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/git?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  return (
    <section className="mb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-2xl p-8 mb-8 border border-orange-200 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-orange-100 p-4 rounded-full">
              <Database className="w-16 h-16 text-orange-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Git's Object Model</h1>
          <p className="text-xl text-gray-700 mb-6 leading-relaxed">
            Git is fundamentally a content-addressable database. Every piece of content is stored as
            an object, identified by a unique SHA-1 hash. Understanding these four object types is
            key to mastering Git's internal workings and unlocking its full potential.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
              📄 Blob Objects
            </span>
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
              📁 Tree Objects
            </span>
            <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold">
              📝 Commit Objects
            </span>
            <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
              🏷️ Tag Objects
            </span>
          </div>
        </div>
      </div>

      {/* Object Type Selector */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8 mb-12 border border-orange-200">
        <div className="flex items-center mb-6">
          <div className="bg-orange-500 rounded-full p-3 mr-4">
            <Database className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Four Object Types</h2>
            <p className="text-gray-600">Click on each type to explore its structure and purpose</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {gitObjects.map((obj) => (
            <button
              key={obj.type}
              onClick={() => setSelectedObject(obj.type)}
              className={`p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                selectedObject === obj.type
                  ? `${obj.borderColor} ${obj.lightColor} shadow-lg transform scale-105`
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${obj.color} text-white`}
              >
                {obj.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{obj.name}</h3>
              <p className="text-sm text-gray-600">{obj.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Visualization */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Object Relationships</h2>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <ObjectModel2D selectedObject={selectedObject} onObjectSelect={setSelectedObject} />
        </div>
      </div>

      {/* Object Details */}
      {selectedObjectData && (
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div
            className={`${selectedObjectData.lightColor} rounded-xl p-8 border ${selectedObjectData.borderColor}`}
          >
            <div className="flex items-center mb-6">
              <div className={`${selectedObjectData.color} rounded-full p-3 mr-4 text-white`}>
                {selectedObjectData.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedObjectData.name} Object
                </h3>
                <p className="text-gray-600">{selectedObjectData.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Content Structure</h4>
                <p className="text-gray-700 mb-3">{selectedObjectData.content}</p>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{selectedObjectData.example}</pre>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Object Hash</h4>
                <div className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-gray-500" />
                  <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono text-gray-800">
                    {selectedObjectData.sha}
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">SHA-1 Hashing Process</h3>

            {hashingSteps.map((step, index) => (
              <div
                key={step.step}
                className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">
                    {step.step}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">{step.title}</h4>
                </div>
                <p className="text-gray-700 mb-3">{step.description}</p>
                <div className="bg-gray-50 rounded p-3">
                  <code className="text-sm text-gray-800 font-mono">{step.example}</code>
                </div>
                {index < hashingSteps.length - 1 && (
                  <div className="flex justify-center mt-4">
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Concepts */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Concepts</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-orange-500 rounded-full p-2 mr-4 mt-1">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Content Addressing</h3>
                <p className="text-gray-700">
                  Objects are stored and retrieved using their SHA-1 hash as the key. Identical
                  content always produces the same hash, enabling deduplication.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-orange-500 rounded-full p-2 mr-4 mt-1">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Immutability</h3>
                <p className="text-gray-700">
                  Once created, objects never change. Any modification creates a new object with a
                  different hash, ensuring data integrity.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-orange-500 rounded-full p-2 mr-4 mt-1">
                <GitCommit className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Object References</h3>
                <p className="text-gray-700">
                  Objects reference each other by hash: commits point to trees, trees point to blobs
                  and other trees, forming a directed acyclic graph.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-orange-500 rounded-full p-2 mr-4 mt-1">
                <Hash className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Cryptographic Security</h3>
                <p className="text-gray-700">
                  SHA-1 hashing ensures data integrity and makes tampering detectable. Any change to
                  content or history is immediately visible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps Navigation */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8 border border-orange-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Master Git Objects in Practice</h2>
        <p className="text-xl text-gray-700 mb-6">
          Now that you understand Git's object model, learn how these objects work together in
          everyday Git workflows.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigateToSection('Core Workflow')}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center mb-2">
              <GitCommit className="w-6 h-6 text-orange-600 mr-2" />
              <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                Core Workflow
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              See how objects are created through Git commands
            </p>
          </button>

          <button
            onClick={() => navigateToSection('Branching & Merging')}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center mb-2">
              <ArrowRight className="w-6 h-6 text-orange-600 mr-2" />
              <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                Branching & Merging
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              Understand object relationships in complex workflows
            </p>
          </button>

          <button
            onClick={() => navigateToSection('History Management')}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center mb-2">
              <Hash className="w-6 h-6 text-orange-600 mr-2" />
              <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                History Management
              </h3>
            </div>
            <p className="text-sm text-gray-600">Learn to manipulate Git objects safely</p>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ObjectModel;
