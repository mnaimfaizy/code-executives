import { Scene } from 'three';

export interface IModel {
  /** Called once when the model is added to the engine */
  init(scene: Scene): void;
  /** Called every frame with delta time in seconds */
  update(dt: number): void;
  /** Cleanup any resources */
  dispose(): void;
}

export type Disposable = { dispose(): void };
