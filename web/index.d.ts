export enum EmitterShape {
  point,
  line,
  rectangle,
  circle,
  cuboid,
  sphere,
}

export enum EmitterMode {
  points,
  outline,
  surface,
  volume,
}

export interface Offset {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export class Emitter {
  emitterPosition: Offset = { x: 0, y: 0 };
  emitterSize: Size = { width: 0, height: 0 };
  emitterShape: EmitterShape = EmitterShape.point;
  emitterMode: EmitterMode = EmitterMode.surface;
  birthRate: number = 1;
  cells: Cell[] = [];
  update(ms: number);
  draw(canvas: CanvasRenderingContext2D);
}

export class Cell {
  constructor(readonly identifier: string) {}

  birthRate: number = 1;
  contents?: HTMLImageElement;
  lifttime: number = 0;
  lifttimeRange: number = 0;
  velocity: number = 0;
  velocityRange: number = 0;
  alphaSpeed: number = 0;
  alphaRange: number = 0;
  acceleration: Offset = { x: 0, y: 0 };
  scale: number = 1.0;
  scaleSpeed: number = 0.0;
  scaleRange: number = 0.0;
  emissionLongitude: number = 0.0;
  emissionRange: number = 0.0;
  spin: number = 0.0;
  spinRange: number = 0.0;
}

export default Lizi;