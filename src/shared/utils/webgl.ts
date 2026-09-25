/** True when the browser can create a WebGL context (checked once, lazily). */
let cached: boolean | undefined;

export function canUseWebGL(): boolean {
  if (cached !== undefined) return cached;
  try {
    const canvas = document.createElement('canvas');
    cached = Boolean(
      window.WebGL2RenderingContext
        ? canvas.getContext('webgl2')
        : window.WebGLRenderingContext && canvas.getContext('webgl')
    );
  } catch {
    cached = false;
  }
  return cached;
}
