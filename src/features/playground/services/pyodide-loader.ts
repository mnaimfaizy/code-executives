/**
 * Pyodide CDN Loader
 *
 * Loads the Pyodide WebAssembly runtime from CDN on demand.
 * Pyodide is NOT bundled — it's ~11 MB loaded at runtime only when the user
 * selects Python as their language.
 *
 * Security: Only loads from the approved jsdelivr.net CDN.
 */

/** Approved Pyodide CDN URL */
const PYODIDE_CDN_URL = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js';

/** Pyodide interface (minimal typing for what we use) */
export interface PyodideInstance {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (options: { batched: (msg: string) => void }) => void;
  setStderr: (options: { batched: (msg: string) => void }) => void;
  globals: {
    get: (name: string) => unknown;
    set: (name: string, value: unknown) => void;
  };
}

/** Loading state for UI feedback */
export interface PyodideLoadingState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
}

/** Singleton: cached Pyodide instance */
let cachedInstance: PyodideInstance | null = null;
let loadPromise: Promise<PyodideInstance> | null = null;

/**
 * Dynamically loads the Pyodide script from CDN and initializes the runtime.
 * Returns a cached instance if already loaded.
 */
export async function loadPyodideRuntime(): Promise<PyodideInstance> {
  // Return cached instance if available
  if (cachedInstance) return cachedInstance;

  // Return existing load promise if loading is in progress
  if (loadPromise) return loadPromise;

  loadPromise = (async (): Promise<PyodideInstance> => {
    // Load the Pyodide script from CDN
    await new Promise<void>((resolve, reject) => {
      // Check if already loaded (e.g., by a previous failed attempt that got the script)
      if (typeof (window as unknown as Record<string, unknown>).loadPyodide === 'function') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = PYODIDE_CDN_URL;
      script.async = true;

      script.onload = (): void => resolve();
      script.onerror = (): void => {
        reject(new Error('Failed to load Pyodide from CDN. Check your network connection.'));
      };

      document.head.appendChild(script);
    });

    // Initialize the Pyodide runtime
    const loadPyodide = (window as unknown as Record<string, unknown>).loadPyodide as (options: {
      indexURL: string;
    }) => Promise<PyodideInstance>;

    if (typeof loadPyodide !== 'function') {
      throw new Error('Pyodide script loaded but loadPyodide function not found');
    }

    const instance = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/',
    });

    cachedInstance = instance;
    return instance;
  })();

  try {
    return await loadPromise;
  } catch (err) {
    // Reset so user can retry
    loadPromise = null;
    throw err;
  }
}

/** Check if Pyodide is already loaded */
export function isPyodideReady(): boolean {
  return cachedInstance !== null;
}
