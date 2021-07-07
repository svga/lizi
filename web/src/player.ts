// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.

import { CanvasRenderer } from "./canvas/canvas_renderer";
import { Emitter } from "./emitter";
import { Renderer } from "./renderer";
import { WebGLRenderer } from "./webgl/webgl_renderer";

const canUseWebGL = () => {
  let canvas = document.createElement("canvas");
  let gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (gl && gl instanceof WebGLRenderingContext) {
    return true;
  } else {
    return false;
  }
};

export class Player {
  static canUseWebGL: boolean = canUseWebGL();

  private renderer: Renderer;
  private running: boolean = false;

  constructor(readonly canvas: HTMLCanvasElement) {
    if (Player.canUseWebGL) {
      try {
        this.renderer = new WebGLRenderer(canvas);
      } catch (error) {
        this.renderer = new CanvasRenderer(canvas);
      }
    } else {
      this.renderer = new CanvasRenderer(canvas);
    }
  }

  addEmitter(emitter: Emitter): void {
    this.renderer.addEmitter(emitter);
  }

  removeEmitter(emitter: Emitter): void {
    this.renderer.removeEmitter(emitter);
  }

  removeAllEmitters(): void {
    this.renderer.removeAllEmitters();
  }

  start() {
    this.running = true;
    requestAnimationFrame(this.onTick.bind(this));
  }

  stop() {
    this.running = false;
  }

  onTick(time: number) {
    if (!this.running) return;
    this.renderer.onTick(time);
    requestAnimationFrame(this.onTick.bind(this));
  }
}
