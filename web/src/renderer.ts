// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.

import { Emitter } from "./emitter";
import { EmitterMode, EmitterShape, Offset } from "./types";

export interface Renderer {
  addEmitter(emitter: Emitter): void;
  removeEmitter(emitter: Emitter): void;
  removeAllEmitters(): void;
  onTick(time: number): void;
}

export class RendererUtils {
  static getPosition(
    emitter: Emitter,
    adjustRotation: _RotationAdjusting
  ): Offset {
    if (emitter.emitterShape == EmitterShape.point) {
      return emitter.emitterPosition;
    } else if (
      emitter.emitterShape == EmitterShape.rectangle ||
      emitter.emitterShape == EmitterShape.cuboid
    ) {
      if (emitter.emitterMode == EmitterMode.surface) {
        return {
          x:
            emitter.emitterPosition.x -
            emitter.emitterSize.width / 2.0 +
            Math.random() * emitter.emitterSize.width,
          y:
            emitter.emitterPosition.y -
            emitter.emitterSize.height / 2.0 +
            Math.random() * emitter.emitterSize.height,
        };
      } else if (emitter.emitterMode == EmitterMode.points) {
        return {
          x:
            emitter.emitterPosition.x -
            emitter.emitterSize.width / 2.0 +
            Math.round(Math.random()) * emitter.emitterSize.width,
          y:
            emitter.emitterPosition.y -
            emitter.emitterSize.height / 2.0 +
            Math.round(Math.random()) * emitter.emitterSize.height,
        };
      } else if (emitter.emitterMode == EmitterMode.outline) {
        if (Math.random() < 0.5) {
          const yValue = Math.round(Math.random());
          if (yValue == 0) {
            adjustRotation.value = Math.PI * 1.5;
          } else {
            adjustRotation.value = Math.PI * -1.5;
          }
          return {
            x:
              emitter.emitterPosition.x -
              emitter.emitterSize.width / 2.0 +
              Math.random() * emitter.emitterSize.width,
            y:
              emitter.emitterPosition.y -
              emitter.emitterSize.height / 2.0 +
              yValue * emitter.emitterSize.height,
          };
        } else {
          const xValue = Math.round(Math.random());
          if (xValue == 0) {
            adjustRotation.value = Math.PI * 1.0;
          } else {
            adjustRotation.value = 0.0;
          }
          return {
            x:
              emitter.emitterPosition.x -
              emitter.emitterSize.width / 2.0 +
              xValue * emitter.emitterSize.width,
            y:
              emitter.emitterPosition.y -
              emitter.emitterSize.height / 2.0 +
              Math.random() * emitter.emitterSize.height,
          };
        }
      } else {
        return {
          x:
            emitter.emitterPosition.x -
            emitter.emitterSize.width / 2.0 +
            Math.random() * emitter.emitterSize.width,
          y:
            emitter.emitterPosition.y -
            emitter.emitterSize.height / 2.0 +
            Math.random() * emitter.emitterSize.height,
        };
      }
    } else if (
      emitter.emitterShape == EmitterShape.circle ||
      emitter.emitterShape == EmitterShape.sphere
    ) {
      if (emitter.emitterMode == EmitterMode.surface) {
        const t = Math.PI * 2 * Math.random();
        const x =
          ((Math.random() * emitter.emitterSize.width) / 2.0) * Math.cos(t);
        const y =
          ((Math.random() * emitter.emitterSize.height) / 2.0) * Math.sin(t);
        return {
          x: emitter.emitterPosition.x + x,
          y: emitter.emitterPosition.y + y,
        };
      } else if (emitter.emitterMode == EmitterMode.points) {
        return emitter.emitterPosition;
      } else if (emitter.emitterMode == EmitterMode.outline) {
        const t = Math.PI * 2 * Math.random();
        const x = (emitter.emitterSize.width / 2.0) * Math.cos(t);
        const y = (emitter.emitterSize.height / 2.0) * Math.sin(t);
        adjustRotation.value = t;
        return {
          x: emitter.emitterPosition.x + x,
          y: emitter.emitterPosition.y + y,
        };
      } else {
        const t = Math.PI * 2 * Math.random();
        const x =
          ((Math.random() * emitter.emitterSize.width) / 2.0) * Math.cos(t);
        const y =
          ((Math.random() * emitter.emitterSize.height) / 2.0) * Math.sin(t);
        return {
          x: emitter.emitterPosition.x + x,
          y: emitter.emitterPosition.y + y,
        };
      }
    } else {
      return emitter.emitterPosition;
    }
  }
}

export class _RotationAdjusting {
  value: number = 0;
}
