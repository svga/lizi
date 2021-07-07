"use strict";
// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
var canvas_renderer_1 = require("./canvas/canvas_renderer");
var webgl_renderer_1 = require("./webgl/webgl_renderer");
var canUseWebGL = function () {
    var canvas = document.createElement("canvas");
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl && gl instanceof WebGLRenderingContext) {
        return true;
    }
    else {
        return false;
    }
};
var Player = /** @class */ (function () {
    function Player(canvas) {
        this.canvas = canvas;
        this.running = false;
        if (Player.canUseWebGL) {
            try {
                this.renderer = new webgl_renderer_1.WebGLRenderer(canvas);
            }
            catch (error) {
                this.renderer = new canvas_renderer_1.CanvasRenderer(canvas);
            }
        }
        else {
            this.renderer = new canvas_renderer_1.CanvasRenderer(canvas);
        }
    }
    Player.prototype.addEmitter = function (emitter) {
        this.renderer.addEmitter(emitter);
    };
    Player.prototype.removeEmitter = function (emitter) {
        this.renderer.removeEmitter(emitter);
    };
    Player.prototype.removeAllEmitters = function () {
        this.renderer.removeAllEmitters();
    };
    Player.prototype.start = function () {
        this.running = true;
        requestAnimationFrame(this.onTick.bind(this));
    };
    Player.prototype.stop = function () {
        this.running = false;
    };
    Player.prototype.onTick = function (time) {
        if (!this.running)
            return;
        this.renderer.onTick(time);
        requestAnimationFrame(this.onTick.bind(this));
    };
    Player.canUseWebGL = canUseWebGL();
    return Player;
}());
exports.Player = Player;
