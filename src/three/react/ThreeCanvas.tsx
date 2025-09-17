import React, { useEffect, useImperativeHandle, useRef } from 'react';
import { Engine } from '../core/Engine';
import type { IModel } from '../core/types';

export interface ThreeCanvasProps {
  models?: IModel[];
  background?: number;
  className?: string;
}

export interface ThreeCanvasHandle {
  getEngine(): Engine | null;
}

const ThreeCanvas = React.forwardRef<ThreeCanvasHandle, ThreeCanvasProps>(
  ({ models = [], background, className }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const engineRef = useRef<Engine | null>(null);

    useImperativeHandle(ref, () => ({ getEngine: () => engineRef.current }), []);

    useEffect(() => {
      if (!containerRef.current) return;
      const engine = new Engine(containerRef.current, { background });
      engineRef.current = engine;
      for (const m of models) engine.addModel(m);
      engine.start();
      return () => {
        engine.dispose();
        engineRef.current = null;
      };
      // Note: models are managed in a separate effect to avoid re-creating the engine
      // when the models array changes. We intentionally depend only on `background` here.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [background]);

    // Mount/unmount models changes
    useEffect(() => {
      const engine = engineRef.current;
      if (!engine) return;
      // For simplicity, dispose previous models and re-add
      // In future, could diff models
      engine.stop();
      engine.clearModels();
      for (const m of models) engine.addModel(m);
      engine.start();
    }, [models]);

    return (
      <div
        ref={containerRef}
        className={className}
        style={{ width: '100%', height: '100%', minHeight: '480px' }}
      />
    );
  }
);

export default ThreeCanvas;
