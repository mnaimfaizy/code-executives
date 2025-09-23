import React, { useState, useCallback } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../types/nextjs';

interface RouteBuilderProps extends BaseNextJSVisualizationProps {
  onRouteChange?: (route: RouteDefinition) => void;
  initialRoute?: Partial<RouteDefinition>;
}

interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  parameters: RouteParameter[];
  requestBody?: RequestBodyDefinition;
  responses: RouteResponse[];
  middleware?: string[];
  description: string;
}

interface RouteParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'uuid';
  required: boolean;
  description: string;
  location: 'path' | 'query' | 'header';
}

interface RequestBodyDefinition {
  contentType: 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data';
  schema: Record<string, unknown>;
  required: boolean;
}

interface RouteResponse {
  statusCode: number;
  description: string;
  contentType: string;
  schema?: Record<string, unknown>;
  headers?: Record<string, string>;
}

const RouteBuilder: React.FC<RouteBuilderProps> = ({
  onRouteChange,
  initialRoute,
  className = '',
}) => {
  const [route, setRoute] = useState<RouteDefinition>({
    method: 'GET',
    path: '/api/users',
    parameters: [],
    responses: [
      {
        statusCode: 200,
        description: 'Success',
        contentType: 'application/json',
      },
    ],
    description: 'Get users list',
    ...initialRoute,
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'parameters' | 'request' | 'responses'>(
    'basic'
  );
  const [previewMode, setPreviewMode] = useState(false);

  // Update route and notify parent
  const updateRoute = useCallback(
    (updates: Partial<RouteDefinition>) => {
      const newRoute = { ...route, ...updates };
      setRoute(newRoute);
      onRouteChange?.(newRoute);
    },
    [route, onRouteChange]
  );

  // Add parameter
  const addParameter = () => {
    const newParam: RouteParameter = {
      name: 'param1',
      type: 'string',
      required: false,
      description: 'Parameter description',
      location: 'query',
    };
    updateRoute({
      parameters: [...route.parameters, newParam],
    });
  };

  // Update parameter
  const updateParameter = (index: number, updates: Partial<RouteParameter>) => {
    const newParams = [...route.parameters];
    newParams[index] = { ...newParams[index], ...updates };
    updateRoute({ parameters: newParams });
  };

  // Remove parameter
  const removeParameter = (index: number) => {
    const newParams = route.parameters.filter((_, i) => i !== index);
    updateRoute({ parameters: newParams });
  };

  // Add response
  const addResponse = () => {
    const newResponse: RouteResponse = {
      statusCode: 201,
      description: 'Created',
      contentType: 'application/json',
    };
    updateRoute({
      responses: [...route.responses, newResponse],
    });
  };

  // Update response
  const updateResponse = (index: number, updates: Partial<RouteResponse>) => {
    const newResponses = [...route.responses];
    newResponses[index] = { ...newResponses[index], ...updates };
    updateRoute({ responses: newResponses });
  };

  // Remove response
  const removeResponse = (index: number) => {
    const newResponses = route.responses.filter((_, i) => i !== index);
    updateRoute({ responses: newResponses });
  };

  // Generate curl command
  const generateCurlCommand = () => {
    const method = route.method;
    const url = `https://your-api.com${route.path}`;
    let curl = `curl -X ${method} "${url}"`;

    // Add headers
    curl += ' \\\n  -H "Content-Type: application/json"';

    // Add query parameters
    const queryParams = route.parameters.filter((p) => p.location === 'query');
    if (queryParams.length > 0) {
      const queryString = queryParams
        .map(
          (p) => `${p.name}=${p.type === 'string' ? 'value' : p.type === 'number' ? '123' : 'true'}`
        )
        .join('&');
      curl += ` \\\n  -d "${queryString}"`;
    }

    // Add request body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(method) && route.requestBody) {
      const sampleBody = JSON.stringify(
        {
          example: route.requestBody.contentType === 'application/json' ? 'data' : undefined,
        },
        null,
        2
      );
      curl += ` \\\n  -d '${sampleBody}'`;
    }

    return curl;
  };

  // Generate Next.js route code
  const generateNextJSCode = () => {
    const method = route.method.toLowerCase();
    const exportName = method === 'get' ? 'GET' : method.toUpperCase();

    let code = `import { NextRequest, NextResponse } from 'next/server';\n\n`;
    code += `export async function ${exportName}(request: NextRequest) {\n`;

    // Add parameter extraction
    if (route.parameters.length > 0) {
      code += `  // Extract parameters\n`;
      route.parameters.forEach((param) => {
        if (param.location === 'path') {
          code += `  const ${param.name} = request.nextUrl.pathname.split('/').pop();\n`;
        } else if (param.location === 'query') {
          code += `  const ${param.name} = request.nextUrl.searchParams.get('${param.name}');\n`;
        }
      });
      code += `\n`;
    }

    // Add request body parsing for applicable methods
    if (['POST', 'PUT', 'PATCH'].includes(route.method)) {
      code += `  // Parse request body\n`;
      code += `  const body = await request.json();\n\n`;
    }

    // Add response logic
    code += `  // Route logic here\n`;
    code += `  try {\n`;

    const successResponse = route.responses.find((r) => r.statusCode >= 200 && r.statusCode < 300);
    if (successResponse) {
      code += `    // Success response\n`;
      code += `    return NextResponse.json(\n`;
      code += `      { message: '${successResponse.description}' },\n`;
      code += `      { status: ${successResponse.statusCode} }\n`;
      code += `    );\n`;
    } else {
      code += `    return NextResponse.json({ message: 'Success' }, { status: 200 });\n`;
    }

    code += `  } catch (error) {\n`;
    code += `    return NextResponse.json(\n`;
    code += `      { error: 'Internal server error' },\n`;
    code += `      { status: 500 }\n`;
    code += `    );\n`;
    code += `  }\n`;
    code += `}\n`;

    return code;
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'parameters', label: 'Parameters', icon: '🔧' },
    { id: 'request', label: 'Request Body', icon: '📦' },
    { id: 'responses', label: 'Responses', icon: '📤' },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">API Route Builder</h3>
          <p className="text-sm text-gray-600">Construct Next.js API routes interactively</p>
        </div>
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <span>{previewMode ? '✏️' : '👁️'}</span>
          <span>{previewMode ? 'Edit Mode' : 'Preview Mode'}</span>
        </button>
      </div>

      {!previewMode ? (
        <>
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id as 'basic' | 'parameters' | 'request' | 'responses')
                }
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HTTP Method
                    </label>
                    <select
                      value={route.method}
                      onChange={(e) =>
                        updateRoute({ method: e.target.value as RouteDefinition['method'] })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Route Path
                    </label>
                    <input
                      type="text"
                      value={route.path}
                      onChange={(e) => updateRoute({ path: e.target.value })}
                      placeholder="/api/users"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={route.description}
                    onChange={(e) => updateRoute({ description: e.target.value })}
                    placeholder="Describe what this route does"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {activeTab === 'parameters' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-900">Route Parameters</h4>
                  <button
                    onClick={addParameter}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm flex items-center space-x-1"
                  >
                    <span>+</span>
                    <span>Add Parameter</span>
                  </button>
                </div>

                {route.parameters.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🔧</div>
                    <div>No parameters defined</div>
                    <div className="text-sm">Add parameters to customize your route</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {route.parameters.map((param, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={param.name}
                              onChange={(e) => updateParameter(index, { name: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Type
                            </label>
                            <select
                              value={param.type}
                              onChange={(e) =>
                                updateParameter(index, {
                                  type: e.target.value as RouteParameter['type'],
                                })
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="string">String</option>
                              <option value="number">Number</option>
                              <option value="boolean">Boolean</option>
                              <option value="uuid">UUID</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Location
                            </label>
                            <select
                              value={param.location}
                              onChange={(e) =>
                                updateParameter(index, {
                                  location: e.target.value as RouteParameter['location'],
                                })
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="path">Path</option>
                              <option value="query">Query</option>
                              <option value="header">Header</option>
                            </select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-1">
                              <input
                                type="checkbox"
                                checked={param.required}
                                onChange={(e) =>
                                  updateParameter(index, { required: e.target.checked })
                                }
                                className="rounded"
                              />
                              <span className="text-sm text-gray-700">Required</span>
                            </label>
                            <button
                              onClick={() => removeParameter(index)}
                              className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={param.description}
                            onChange={(e) =>
                              updateParameter(index, { description: e.target.value })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'request' && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Request Body</h4>

                {['POST', 'PUT', 'PATCH'].includes(route.method) ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Content Type
                        </label>
                        <select
                          value={route.requestBody?.contentType || 'application/json'}
                          onChange={(e) =>
                            updateRoute({
                              requestBody: {
                                contentType: e.target.value as RequestBodyDefinition['contentType'],
                                schema: route.requestBody?.schema || {},
                                required: route.requestBody?.required || false,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="application/json">JSON</option>
                          <option value="application/x-www-form-urlencoded">
                            Form URL Encoded
                          </option>
                          <option value="multipart/form-data">Multipart Form Data</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={route.requestBody?.required || false}
                            onChange={(e) =>
                              updateRoute({
                                requestBody: {
                                  contentType: route.requestBody?.contentType || 'application/json',
                                  schema: route.requestBody?.schema || {},
                                  required: (e.target as HTMLInputElement).checked,
                                },
                              })
                            }
                            className="rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">Required</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Schema (JSON)
                      </label>
                      <textarea
                        value={JSON.stringify(route.requestBody?.schema || {}, null, 2)}
                        onChange={(e) => {
                          try {
                            const schema = JSON.parse(e.target.value);
                            updateRoute({
                              requestBody: {
                                contentType: route.requestBody?.contentType || 'application/json',
                                schema,
                                required: route.requestBody?.required || false,
                              },
                            });
                          } catch {
                            // Invalid JSON, ignore
                          }
                        }}
                        placeholder='{"name": "string", "email": "string"}'
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🚫</div>
                    <div>Request body not applicable for {route.method} method</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'responses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-900">Response Definitions</h4>
                  <button
                    onClick={addResponse}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm flex items-center space-x-1"
                  >
                    <span>+</span>
                    <span>Add Response</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {route.responses.map((response, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status Code
                          </label>
                          <input
                            type="number"
                            value={response.statusCode}
                            onChange={(e) =>
                              updateResponse(index, { statusCode: parseInt(e.target.value) || 200 })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Content Type
                          </label>
                          <input
                            type="text"
                            value={response.contentType}
                            onChange={(e) => updateResponse(index, { contentType: e.target.value })}
                            placeholder="application/json"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={() => removeResponse(index)}
                            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                            disabled={route.responses.length === 1}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={response.description}
                          onChange={(e) => updateResponse(index, { description: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Preview Mode */
        <div className="space-y-6">
          {/* Route Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Route Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {route.method}
                  </span>
                  <code className="text-gray-900 font-mono">{route.path}</code>
                </div>
                <p className="text-gray-600 text-sm">{route.description}</p>

                {route.parameters.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Parameters:</h5>
                    <div className="space-y-1">
                      {route.parameters.map((param, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <code className="text-gray-700">{param.name}</code>
                          <span className="text-gray-500">({param.type})</span>
                          <span
                            className={`px-1 py-0.5 rounded text-xs ${
                              param.location === 'path'
                                ? 'bg-purple-100 text-purple-800'
                                : param.location === 'query'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {param.location}
                          </span>
                          {param.required && <span className="text-red-500">*</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Responses:</h5>
                <div className="space-y-1">
                  {route.responses.map((response, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          response.statusCode >= 200 && response.statusCode < 300
                            ? 'bg-green-100 text-green-800'
                            : response.statusCode >= 300 && response.statusCode < 400
                              ? 'bg-blue-100 text-blue-800'
                              : response.statusCode >= 400 && response.statusCode < 500
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {response.statusCode}
                      </span>
                      <span className="text-gray-700">{response.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Generated Code */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Generated Next.js Code</h4>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{generateNextJSCode()}</code>
            </pre>
          </div>

          {/* cURL Example */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">cURL Example</h4>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{generateCurlCommand()}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Route Builder Concepts */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Route Builder Concepts</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">HTTP Methods</h5>
            <ul className="text-gray-600 space-y-1">
              <li>
                • <strong>GET:</strong> Retrieve data (no request body)
              </li>
              <li>
                • <strong>POST:</strong> Create new resources
              </li>
              <li>
                • <strong>PUT:</strong> Update existing resources
              </li>
              <li>
                • <strong>DELETE:</strong> Remove resources
              </li>
              <li>
                • <strong>PATCH:</strong> Partial updates
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Parameter Types</h5>
            <ul className="text-gray-600 space-y-1">
              <li>
                • <strong>Path:</strong> /api/users/[id] - URL segments
              </li>
              <li>
                • <strong>Query:</strong> /api/users?page=1 - URL parameters
              </li>
              <li>
                • <strong>Header:</strong> Custom headers for auth/metadata
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteBuilder;
