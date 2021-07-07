// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.

import { Emitter } from "../emitter";
import { Renderer, RendererUtils, _RotationAdjusting } from "../renderer";
import { fs, vs } from "./shaders";
import { Offset } from "../types";

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize =
    canvas.width !== displayWidth || canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
}

export class WebGLRenderer implements Renderer {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private currentTime: number = 0;
  private birthedTime: number = -1;
  private lifeAttributeLocation: number;
  private positionAttributeLocation: number;
  private texCoordAttributeLocation: number;
  private speedAttributeLocation: number;
  private alphaAttributeLocation: number;
  private scaleAttributeLocation: number;
  private rotationAttributeLocation: number;
  private bufferStore: { [key: string]: WebGLBuffer } = {};
  private resolutionUniformLocation: number;
  private timeUniformLocation: number;
  private texturesUniformLocation: number;
  private emitterLayerModel = new _LayerModel();
  private activeTextures: number[] = [];
  private activeTexturesCache: { [key: string]: number } = {};
  private emitters: Emitter[] = [];

  constructor(readonly canvas: HTMLCanvasElement) {
    this.gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext;
    if (!this.gl) throw "Fail to get webgl context.";
    const vsShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(vsShader!, vs);
    this.gl.compileShader(vsShader!);
    const fsShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(fsShader!, fs);
    this.gl.compileShader(fsShader!);
    this.program = this.gl.createProgram() as WebGLProgram;
    this.gl.attachShader(this.program, vsShader!);
    this.gl.attachShader(this.program, fsShader!);
    this.gl.linkProgram(this.program);
    this.lifeAttributeLocation = this.gl.getAttribLocation(
      this.program,
      "a_life"
    );
    this.positionAttributeLocation = this.gl.getAttribLocation(
      this.program,
      "a_position"
    );
    this.texCoordAttributeLocation = this.gl.getAttribLocation(
      this.program,
      "a_texCoord"
    );
    this.speedAttributeLocation = this.gl.getAttribLocation(
      this.program,
      "a_speed"
    );
    this.alphaAttributeLocation = this.gl.getAttribLocation(
      this.program,
      "a_alpha"
    );
    this.scaleAttributeLocation = this.gl.getAttribLocation(
      this.program,
      "a_scale"
    );
    this.rotationAttributeLocation = this.gl.getAttribLocation(
      this.program,
      "a_rotation"
    );
    this.resolutionUniformLocation = this.gl.getUniformLocation(
      this.program,
      "u_resolution"
    ) as number;
    this.timeUniformLocation = this.gl.getUniformLocation(
      this.program,
      "u_time"
    ) as number;
    this.texturesUniformLocation = this.gl.getUniformLocation(
      this.program,
      "u_textures"
    ) as number;
    resizeCanvasToDisplaySize(this.gl.canvas as HTMLCanvasElement);
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.useProgram(this.program);
    this.gl.uniform2f(
      this.resolutionUniformLocation,
      this.gl.canvas.width,
      this.gl.canvas.height
    );
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
    this.gl.useProgram(this.program);
    this.gl.uniform1f(this.timeUniformLocation, this.currentTime);
    this.birth();
    this.render();
  }

  private createTexture(image: HTMLImageElement): number {
    const textureIndex = this.activeTextures.length;
    const texture = this.gl.createTexture();
    this.gl.activeTexture(this.gl.TEXTURE0 + textureIndex);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.NEAREST
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.NEAREST
    );
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      image
    );
    this.activeTextures.push(textureIndex);
    let textureIds = [];
    for (let tIndex = 0; tIndex < textureIndex + 1; tIndex++) {
      textureIds.push(tIndex);
    }
    this.gl.uniform1iv(this.texturesUniformLocation, textureIds);
    return textureIndex;
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
          if (!cell.contents || cell.contents.width <= 0) continue;
          for (let index = 0; index < cellBirthRate; index++) {
            let particle = new _Particle();
            particle.textureId =
              this.activeTexturesCache[cell.contents.src] ??
              this.createTexture(cell.contents);
            this.activeTexturesCache[cell.contents.src] = particle.textureId;
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
            this.emitterLayerModel.addParticle(particle, this.currentTime);
          }
        }
      }
      this.birthedTime = this.currentTime;
    }
  }

  render() {
    if (this.emitterLayerModel.numberOfParticles() == 0) {
      return;
    }
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    if (this.emitterLayerModel.dirtied) {
      [
        "life",
        "position",
        "texCoord",
        "speed",
        "alpha",
        "scale",
        "rotation",
      ].forEach((type) => {
        const buffered = this.bufferStore[type] !== undefined;
        const buffer = this.bufferStore[type] ?? this.gl.createBuffer();
        this.bufferStore[type] = buffer;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        if (
          this.emitterLayerModel.dirtyIndexes.length > 0 &&
          this.emitterLayerModel.dirtyIndexes.length <
            this.emitterLayerModel.numberOfParticles() / 3
        ) {
          this.emitterLayerModel.dirtyIndexes.forEach((idx) => {
            let offset = 2 * 6 * idx;
            let length = 2 * 6;
            if (type === "speed" || type === "position") {
              offset = 4 * 6 * idx;
              length = 4 * 6;
            } else if (type === "life") {
              offset = 3 * 6 * idx;
              length = 3 * 6;
            } else if (type === "alpha") {
              offset = 3 * 6 * idx;
              length = 3 * 6;
            }
            let data = (
              (this.emitterLayerModel as any)[type] as number[]
            ).slice(offset, offset + length);
            this.gl.bufferSubData(
              this.gl.ARRAY_BUFFER,
              offset * 4,
              new Float32Array(data)
            );
          });
        } else {
          this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array((this.emitterLayerModel as any)[type]),
            this.gl.DYNAMIC_DRAW
          );
        }
        if (!buffered) {
          this.gl.enableVertexAttribArray(
            (this as any)[`${type}AttributeLocation`]
          );
          this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
          let count = 2;
          if (type === "speed" || type === "position") {
            count = 4;
          } else if (type === "life") {
            count = 3;
          } else if (type === "alpha") {
            count = 3;
          }
          this.gl.vertexAttribPointer(
            (this as any)[`${type}AttributeLocation`],
            count,
            this.gl.FLOAT,
            false,
            0,
            0
          );
        }
      });
      this.emitterLayerModel.dirtied = false;
      this.emitterLayerModel.dirtyIndexes = [];
    }
    this.gl.drawArrays(
      this.gl.TRIANGLES,
      0,
      this.emitterLayerModel.numberOfParticles() * 6
    );
  }
}

class _LayerModel {
  private allParticles: _Particle[] = [];
  private life: number[] = [];
  private position: number[] = [];
  private speed: number[] = [];
  private alpha: number[] = [];
  private scale: number[] = [];
  private rotation: number[] = [];
  private texCoord: number[] = [];
  private deathRange: { [key: number]: number[] } = {};
  dirtied = true;
  dirtyIndexes: number[] = [];

  addParticle(model: _Particle, currentTime: number) {
    this.dirtied = true;
    let needPush = true;
    let index = this.allParticles.length;
    let deathKeys = Object.keys(this.deathRange);
    for (let nIndex = 0; nIndex < deathKeys.length; nIndex++) {
      let deathKey = parseInt(deathKeys[nIndex]);
      if (deathKey < currentTime) {
        if (this.deathRange[deathKey].length > 0) {
          index = this.deathRange[deathKey].shift() as number;
          this.dirtyIndexes.push(index);
          needPush = false;
          break;
        } else {
          delete this.deathRange[deathKey];
        }
      }
    }
    if (needPush) {
      this.dirtyIndexes = [];
    }
    model.startLife = currentTime + model.delay;
    if (model.alphaSpeed < 0.0) {
      const alphaLife = (0.0 - model.alpha / model.alphaSpeed) * 1000;
      model.maxLife = Math.min(model.maxLife, alphaLife);
    }
    if (!model.repeat) {
      let deathRangeIndex =
        model.startLife +
        model.maxLife -
        ((model.startLife + model.maxLife) % 1000) +
        1000;
      if (!this.deathRange[deathRangeIndex]) {
        this.deathRange[deathRangeIndex] = [];
      }
      this.deathRange[deathRangeIndex].push(index);
    }
    this.allParticles[index] = model;
    this.resetBufferData(this.life, index * 18, [
      model.startLife,
      model.startLife + model.maxLife,
      model.repeat ? 1 : 0,
      model.startLife,
      model.startLife + model.maxLife,
      model.repeat ? 1 : 0,
      model.startLife,
      model.startLife + model.maxLife,
      model.repeat ? 1 : 0,
      model.startLife,
      model.startLife + model.maxLife,
      model.repeat ? 1 : 0,
      model.startLife,
      model.startLife + model.maxLife,
      model.repeat ? 1 : 0,
      model.startLife,
      model.startLife + model.maxLife,
      model.repeat ? 1 : 0,
    ]);
    this.resetBufferData(this.position, index * 24, [
      -model.size / 2.0,
      -model.size / 2.0,
      model.position.x,
      model.position.y,
      +model.size / 2.0,
      -model.size / 2.0,
      model.position.x,
      model.position.y,
      +model.size / 2.0,
      +model.size / 2.0,
      model.position.x,
      model.position.y,
      -model.size / 2.0,
      -model.size / 2.0,
      model.position.x,
      model.position.y,
      +model.size / 2.0,
      +model.size / 2.0,
      model.position.x,
      model.position.y,
      -model.size / 2.0,
      +model.size / 2.0,
      model.position.x,
      model.position.y,
    ]);
    this.resetBufferData(
      this.texCoord,
      index * 12,
      [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]
    );
    this.resetBufferData(this.speed, index * 24, [
      model.velocity.x,
      model.velocity.y,
      model.acceleration.x,
      model.acceleration.y,
      model.velocity.x,
      model.velocity.y,
      model.acceleration.x,
      model.acceleration.y,
      model.velocity.x,
      model.velocity.y,
      model.acceleration.x,
      model.acceleration.y,
      model.velocity.x,
      model.velocity.y,
      model.acceleration.x,
      model.acceleration.y,
      model.velocity.x,
      model.velocity.y,
      model.acceleration.x,
      model.acceleration.y,
      model.velocity.x,
      model.velocity.y,
      model.acceleration.x,
      model.acceleration.y,
    ]);
    this.resetBufferData(this.alpha, index * 18, [
      model.alpha,
      model.alphaSpeed,
      model.textureId,
      model.alpha,
      model.alphaSpeed,
      model.textureId,
      model.alpha,
      model.alphaSpeed,
      model.textureId,
      model.alpha,
      model.alphaSpeed,
      model.textureId,
      model.alpha,
      model.alphaSpeed,
      model.textureId,
      model.alpha,
      model.alphaSpeed,
      model.textureId,
    ]);
    this.resetBufferData(this.scale, index * 12, [
      model.scale,
      model.scaleSpeed,
      model.scale,
      model.scaleSpeed,
      model.scale,
      model.scaleSpeed,
      model.scale,
      model.scaleSpeed,
      model.scale,
      model.scaleSpeed,
      model.scale,
      model.scaleSpeed,
    ]);
    this.resetBufferData(this.rotation, index * 12, [
      model.rotation,
      model.rotationSpeed,
      model.rotation,
      model.rotationSpeed,
      model.rotation,
      model.rotationSpeed,
      model.rotation,
      model.rotationSpeed,
      model.rotation,
      model.rotationSpeed,
      model.rotation,
      model.rotationSpeed,
    ]);
  }

  private resetBufferData(
    bufferData: number[],
    offset: number,
    data: number[]
  ) {
    for (
      let index = offset, dataIndex = 0;
      index < offset + data.length;
      index++, dataIndex++
    ) {
      bufferData[index] = data[dataIndex];
    }
  }

  numberOfParticles(): number {
    return this.allParticles.length;
  }
}

class _Particle {
  textureId: number = -1;
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
