// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.

import { Emitter } from "../emitter";
import { Renderer, RendererUtils, _RotationAdjusting } from "../renderer";
import { Offset } from "../types";

export class CanvasRenderer implements Renderer {
  private context: CanvasRenderingContext2D;
  private emitters: Emitter[] = [];
  private currentTime: number = 0;
  private birthedTime: number = -1;
  private allParticles: _Particle[] = [];
  private deathRange: { [key: number]: number[] } = {};

  constructor(readonly canvas: HTMLCanvasElement) {
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  addEmitter(emitter: Emitter) {
    this.emitters.push(emitter);
  }

  removeEmitter(emitter: Emitter) {
    const targetIndex = this.emitters.indexOf(emitter);
    if (targetIndex >= 0) {
      delete this.emitters[targetIndex];
    }
  }

  removeAllEmitters() {
    this.emitters = [];
  }

  onTick(time: number) {
    this.currentTime = time;
    this.birth();
    this.render();
  }

  private birth() {
    if (this.birthedTime < 0 || this.birthedTime + 1000 < this.currentTime) {
      for (
        let emitterIndex = 0;
        emitterIndex < this.emitters.length;
        emitterIndex++
      ) {
        let emitter = this.emitters[emitterIndex];
        for (let cellIndex = 0; cellIndex < emitter.cells.length; cellIndex++) {
          let cell = emitter.cells[cellIndex];
          let cellBirthRate = emitter.birthRate * cell.birthRate;
          for (let index = 0; index < cellBirthRate; index++) {
            let particle = new _Particle();
            particle.texture = cell.contents;
            particle.size = cell.contents?.width ?? 0.0;
            particle.delay = Math.random() * 1000;
            particle.maxLife =
              (cell.lifttime +
                -cell.lifttimeRange / 2.0 +
                Math.random() * cell.lifttimeRange) *
              1000;
            const adjustRotation = new _RotationAdjusting();
            particle.position = RendererUtils.getPosition(
              emitter,
              adjustRotation
            );
            var emissionLongitude =
              cell.emissionLongitude -
              cell.emissionRange / 2.0 +
              Math.random() * cell.emissionRange;

            if (adjustRotation.value != 0.0) {
              emissionLongitude += adjustRotation.value;
            }
            const theXPositionSpeed =
              cell.velocity -
              cell.velocityRange / 2.0 +
              Math.random() * cell.velocityRange;
            particle.velocity = {
              x: theXPositionSpeed * Math.cos(emissionLongitude),
              y: theXPositionSpeed * Math.sin(emissionLongitude),
            };
            particle.acceleration = cell.acceleration;
            particle.scale =
              cell.scale -
              cell.scaleRange / 2 +
              Math.random() * cell.scaleRange;
            particle.scaleSpeed = cell.scaleSpeed;
            particle.alpha =
              1.0 - cell.alphaRange / 2.0 + Math.random() * cell.alphaRange;
            particle.alphaSpeed = cell.alphaSpeed;
            particle.rotation = 0.0;
            particle.rotationSpeed =
              cell.spin - cell.spinRange / 2 + Math.random() * cell.spinRange;
            this.addParticle(particle);
          }
        }
      }
      this.birthedTime = this.currentTime;
    }
  }

  private render() {
    this.context.clearRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height
    );
    for (let index = 0; index < this.allParticles.length; index++) {
      const element = this.allParticles[index];
      this.renderParticleItem(element);
    }
  }

  private renderParticleItem(particle: _Particle) {
    let currentTime = this.currentTime - particle.startLife;
    const texture = particle.texture;
    if (!texture) return;
    const startTime = particle.startLife;
    const endTime = particle.startLife + particle.maxLife;
    if (particle.repeat) {
      let nTime = this.currentTime - startTime;
      let segTime = endTime - startTime;
      currentTime = nTime - Math.floor(nTime / segTime) * segTime;
    } else if (currentTime < 0.0 || currentTime > endTime) {
      return;
    }
    const currentScale =
      particle.scale + particle.scaleSpeed * (currentTime / 1000.0);
    const currentPosition: Offset = {
      x:
        particle.position.x +
        particle.velocity.x * (currentTime / 1000.0) +
        0.5 *
          particle.acceleration.x *
          (currentTime / 1000.0) *
          (currentTime / 1000.0),
      y:
        particle.position.y +
        particle.velocity.y * (currentTime / 1000.0) +
        0.5 *
          particle.acceleration.y *
          (currentTime / 1000.0) *
          (currentTime / 1000.0),
    };
    const currentRotation =
      particle.rotation + particle.rotationSpeed * (currentTime / 1000.0);
    const currentAlpha =
      particle.alpha + particle.alphaSpeed * (currentTime / 1000.0);
    this.context.save();
    this.context.translate(
      particle.texture!.width / 2.0,
      particle.texture!.height / 2.0
    );
    this.context.translate(currentPosition.x, currentPosition.y);
    this.context.rotate(currentRotation);
    this.context.scale(Math.abs(currentScale), Math.abs(currentScale));
    this.context.translate(
      -particle.texture!.width / 2.0,
      -particle.texture!.height / 2.0
    );
    this.context.globalAlpha = Math.max(0.0, Math.min(1.0, currentAlpha));
    this.context.drawImage(
      texture,
      0,
      0,
      texture.width,
      texture.height,
      0,
      0,
      particle.size,
      particle.size
    );
    this.context.restore();
  }

  private addParticle(particle: _Particle) {
    let index = this.allParticles.length;
    let deathKeys = Object.keys(this.deathRange);
    for (let nIndex = 0; nIndex < deathKeys.length; nIndex++) {
      let deathKey = parseInt(deathKeys[nIndex]);
      if (deathKey < this.currentTime) {
        if (this.deathRange[deathKey].length > 0) {
          index = this.deathRange[deathKey].shift() as number;
          break;
        } else {
          delete this.deathRange[deathKey];
        }
      }
    }
    particle.startLife = this.currentTime + particle.delay;
    if (particle.alphaSpeed < 0.0) {
      const alphaLife = (0.0 - particle.alpha / particle.alphaSpeed) * 1000;
      particle.maxLife = Math.min(particle.maxLife, alphaLife);
    }
    if (!particle.repeat) {
      let deathRangeIndex =
        particle.startLife +
        particle.maxLife -
        ((particle.startLife + particle.maxLife) % 1000) +
        1000;
      if (!this.deathRange[deathRangeIndex]) {
        this.deathRange[deathRangeIndex] = [];
      }
      this.deathRange[deathRangeIndex].push(index);
    }
    this.allParticles[index] = particle;
  }
}

class _Particle {
  texture?: HTMLImageElement;
  size: number = 0;
  delay: number = 0;
  startLife: number = 0;
  maxLife: number = 0;
  repeat: boolean = false;
  position: Offset = { x: 0, y: 0 };
  velocity: Offset = { x: 0, y: 0 };
  acceleration: Offset = { x: 0, y: 0 };
  scale: number = 1;
  scaleSpeed: number = 0;
  alpha: number = 1;
  alphaSpeed: number = 0;
  rotation: number = 0;
  rotationSpeed: number = 0;
}
