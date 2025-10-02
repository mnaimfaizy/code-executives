import React, { useState, useEffect, useCallback } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../../../types/nextjs';

interface MiddlewareSimulatorProps extends BaseNextJSVisualizationProps {
  middlewareRules: MiddlewareRule[];
  showLogs?: boolean;
}

interface MiddlewareRule {
  id: string;
  name: string;
  condition: string;
  action: 'allow' | 'deny' | 'redirect' | 'rewrite' | 'modify';
  priority: number;
  enabled: boolean;
}

interface RequestSimulation {
  id: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: unknown;
  timestamp: number;
  status: 'pending' | 'processing' | 'allowed' | 'denied' | 'redirected' | 'modified';
  appliedRules: string[];
  finalPath?: string;
  response?: unknown;
}

const MiddlewareSimulator: React.FC<MiddlewareSimulatorProps> = ({
  middlewareRules = [],
  showLogs = true,
  className = '',
}) => {
  const [requests, setRequests] = useState<RequestSimulation[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentRequest, setCurrentRequest] = useState<RequestSimulation | null>(null);

  // Default middleware rules
  const defaultRules: MiddlewareRule[] = [
    {
      id: 'auth',
      name: 'Authentication',
      condition: 'path.startsWith("/api/admin")',
      action: 'deny',
      priority: 1,
      enabled: true,
    },
    {
      id: 'cors',
      name: 'CORS Headers',
      condition: 'true',
      action: 'modify',
      priority: 2,
      enabled: true,
    },
    {
      id: 'redirect',
      name: 'Legacy Redirect',
      condition: 'path === "/old-path"',
      action: 'redirect',
      priority: 3,
      enabled: true,
    },
    {
      id: 'rewrite',
      name: 'API Version Rewrite',
      condition: 'path.startsWith("/api/v1/")',
      action: 'rewrite',
      priority: 4,
      enabled: true,
    },
  ];

  const activeRules = middlewareRules.length > 0 ? middlewareRules : defaultRules;

  // Simulate middleware processing
  const processRequest = useCallback(
    (request: RequestSimulation): RequestSimulation => {
      const processedRequest: RequestSimulation = {
        ...request,
        appliedRules: [],
        status: 'processing' as const,
      };
      const newLogs: string[] = [];

      newLogs.push(
        `[${new Date().toLocaleTimeString()}] Processing ${request.method} ${request.path}`
      );

      // Sort rules by priority
      const sortedRules = [...activeRules]
        .filter((r) => r.enabled)
        .sort((a, b) => a.priority - b.priority);

      for (const rule of sortedRules) {
        try {
          // Evaluate condition (simplified - in real middleware this would be more complex)
          let conditionMet = false;

          switch (rule.condition) {
            case 'path.startsWith("/api/admin")':
              conditionMet = request.path.startsWith('/api/admin');
              break;
            case 'true':
              conditionMet = true;
              break;
            case 'path === "/old-path"':
              conditionMet = request.path === '/old-path';
              break;
            case 'path.startsWith("/api/v1/")':
              conditionMet = request.path.startsWith('/api/v1/');
              break;
            default:
              conditionMet = false;
          }

          if (conditionMet) {
            processedRequest.appliedRules.push(rule.id);
            newLogs.push(`[${new Date().toLocaleTimeString()}] Rule "${rule.name}" triggered`);

            switch (rule.action) {
              case 'allow':
                processedRequest.status = 'allowed';
                newLogs.push(`[${new Date().toLocaleTimeString()}] Request allowed`);
                break;
              case 'deny':
                processedRequest.status = 'denied';
                processedRequest.response = { error: 'Access denied', status: 403 };
                newLogs.push(`[${new Date().toLocaleTimeString()}] Request denied`);
                break;
              case 'redirect':
                processedRequest.status = 'redirected';
                processedRequest.response = { redirect: '/new-path', status: 302 };
                newLogs.push(
                  `[${new Date().toLocaleTimeString()}] Request redirected to /new-path`
                );
                break;
              case 'rewrite':
                processedRequest.finalPath = request.path.replace('/api/v1/', '/api/v2/');
                processedRequest.status = 'modified';
                newLogs.push(
                  `[${new Date().toLocaleTimeString()}] Path rewritten to ${processedRequest.finalPath}`
                );
                break;
              case 'modify':
                processedRequest.status = 'modified';
                processedRequest.headers = {
                  ...processedRequest.headers,
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
                  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                };
                newLogs.push(`[${new Date().toLocaleTimeString()}] CORS headers added`);
                break;
            }
          }
        } catch (error) {
          newLogs.push(
            `[${new Date().toLocaleTimeString()}] Error processing rule "${rule.name}": ${error}`
          );
        }
      }

      // If no rules applied, allow by default
      if (processedRequest.appliedRules.length === 0) {
        processedRequest.status = 'allowed';
        newLogs.push(`[${new Date().toLocaleTimeString()}] No rules applied, request allowed`);
      }

      setLogs((prev) => [...prev, ...newLogs]);
      return processedRequest;
    },
    [activeRules]
  );

  // Generate sample requests
  const generateRequest = (): RequestSimulation => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const paths = [
      '/api/users',
      '/api/admin/users',
      '/api/posts',
      '/old-path',
      '/api/v1/users',
      '/api/public',
    ];

    return {
      id: `req-${Date.now()}-${Math.random()}`,
      method: methods[Math.floor(Math.random() * methods.length)],
      path: paths[Math.floor(Math.random() * paths.length)],
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; MiddlewareSimulator/1.0)',
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: Math.random() > 0.5 ? { data: 'sample payload' } : undefined,
      timestamp: Date.now(),
      status: 'pending',
      appliedRules: [],
    };
  };

  // Auto-generate requests
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const newRequest = generateRequest();
      setRequests((prev) => [...prev.slice(-4), newRequest]); // Keep last 5 requests
      setCurrentRequest(newRequest);

      // Process after a short delay
      setTimeout(() => {
        setRequests((prev) =>
          prev.map((req) => (req.id === newRequest.id ? processRequest(req) : req))
        );
        setCurrentRequest(null);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating, activeRules, processRequest]);

  const toggleSimulation = () => {
    setIsSimulating(!isSimulating);
    if (!isSimulating) {
      setLogs([]);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'allowed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'denied':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'redirected':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'modified':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'processing':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'allow':
        return 'bg-green-100 text-green-800';
      case 'deny':
        return 'bg-red-100 text-red-800';
      case 'redirect':
        return 'bg-blue-100 text-blue-800';
      case 'rewrite':
        return 'bg-purple-100 text-purple-800';
      case 'modify':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSimulation}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              isSimulating
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <span>{isSimulating ? '⏸️' : '▶️'}</span>
            <span>{isSimulating ? 'Stop Simulation' : 'Start Simulation'}</span>
          </button>
          {showLogs && (
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>🗑️</span>
              <span>Clear Logs</span>
            </button>
          )}
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Allowed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Denied</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Modified</span>
          </div>
        </div>
      </div>

      {/* Middleware Rules */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Active Middleware Rules</h3>
        <div className="space-y-2">
          {activeRules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${rule.enabled ? 'bg-green-500' : 'bg-gray-400'}`}
                />
                <div>
                  <div className="font-medium text-gray-900">{rule.name}</div>
                  <div className="text-sm text-gray-600">{rule.condition}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(rule.action)}`}
                >
                  {rule.action}
                </span>
                <span className="text-sm text-gray-500">Priority: {rule.priority}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Request Processing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Current Requests */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Request Processing</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📨</div>
                <div>No requests yet</div>
                <div className="text-sm">Start simulation to see requests</div>
              </div>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    currentRequest?.id === request.id ? 'ring-2 ring-blue-500 shadow-md' : ''
                  } ${getStatusColor(request.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-gray-800 text-white text-xs font-mono rounded">
                        {request.method}
                      </span>
                      <code className="text-sm font-mono text-gray-900">
                        {request.finalPath || request.path}
                      </code>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}
                    >
                      {request.status}
                    </span>
                  </div>

                  {request.appliedRules.length > 0 && (
                    <div className="text-xs text-gray-600 mb-2">
                      Rules applied: {request.appliedRules.join(', ')}
                    </div>
                  )}

                  {request.response ? (
                    <div className="text-xs bg-white p-2 rounded border font-mono">
                      {JSON.stringify(request.response as Record<string, unknown>, null, 2)}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Processing Logs */}
        {showLogs && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Processing Logs</h3>
            <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{requests.length}</div>
          <div className="text-sm text-gray-600">Total Requests</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {requests.filter((r) => r.status === 'allowed').length}
          </div>
          <div className="text-sm text-gray-600">Allowed</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {requests.filter((r) => r.status === 'denied').length}
          </div>
          <div className="text-sm text-gray-600">Denied</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {requests.filter((r) => r.status === 'modified' || r.status === 'redirected').length}
          </div>
          <div className="text-sm text-gray-600">Modified</div>
        </div>
      </div>

      {/* Middleware Concepts */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Middleware Concepts</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Request Flow</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Middleware runs before route handlers</li>
              <li>• Rules are evaluated in priority order</li>
              <li>• Actions can modify, redirect, or block requests</li>
              <li>• Multiple rules can apply to one request</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Common Actions</h5>
            <ul className="text-gray-600 space-y-1">
              <li>
                • <strong>Allow:</strong> Continue to route handler
              </li>
              <li>
                • <strong>Deny:</strong> Block request with error
              </li>
              <li>
                • <strong>Redirect:</strong> Send to different URL
              </li>
              <li>
                • <strong>Rewrite:</strong> Change request path internally
              </li>
              <li>
                • <strong>Modify:</strong> Add headers or transform request
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiddlewareSimulator;
