# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

## 3D/2D Visualization Architecture

We use Three.js for 3D models with a modular structure under `src/three/`:

- `core/Engine.ts`: Lightweight host that creates a scene, camera, renderer, shared lights, and an animation loop. It manages model lifecycle.
- `core/types.ts`: `IModel` interface that all 3D models implement: `init(scene)`, `update(dt)`, `dispose()`.
- `core/anim.ts`: Tiny tween scheduler for simple time-based animations.
- `react/ThreeCanvas.tsx`: React bridge that mounts the engine in a div and registers provided models.
- `models/CallStackAssemblyLine.ts`: First model visualizing the Call Stack as an assembly line (conveyor + lift). Exposes `pushFrame()` and `popFrame()`.

Add a new model:

1. Create `src/three/models/MyModel.ts` implementing `IModel`.
2. Import it in a page and pass an instance to `ThreeCanvas` via `models={[new MyModel()]}`.
3. Expose imperative methods on your model (e.g., `step()`) and call them from UI buttons.
