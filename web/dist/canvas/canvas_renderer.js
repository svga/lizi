"use strict";
// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasRenderer = void 0;
var renderer_1 = require("../renderer");
var CanvasRenderer = /** @class */ (function () {
    function CanvasRenderer(canvas) {
        this.canvas = canvas;
        this.emitters = [];
        this.currentTime = 0;
        this.birthedTime = -1;
        this.allParticles = [];
        this.deathRange = {};
        this.context = canvas.getContext("2d");
    }
    CanvasRenderer.prototype.addEmitter = function (emitter) {
        this.emitters.push(emitter);
    };
    CanvasRenderer.prototype.removeEmitter = function (emitter) {
        var targetIndex = this.emitters.indexOf(emitter);
        if (targetIndex >= 0) {
            delete this.emitters[targetIndex];
        }
    };
    CanvasRenderer.prototype.removeAllEmitters = function () {
        this.emitters = [];
    };
    CanvasRenderer.prototype.onTick = function (time) {
        this.currentTime = time;
        this.birth();
        this.render();
    };
    CanvasRenderer.prototype.birth = function () {
        var _a, _b;
        if (this.birthedTime < 0 || this.birthedTime + 1000 < this.currentTime) {
            for (var emitterIndex = 0; emitterIndex < this.emitters.length; emitterIndex++) {
                var emitter = this.emitters[emitterIndex];
                for (var cellIndex = 0; cellIndex < emitter.cells.length; cellIndex++) {
                    var cell = emitter.cells[cellIndex];
                    var cellBirthRate = emitter.birthRate * cell.birthRate;
                    for (var index = 0; index < cellBirthRate; index++) {
                        var particle = new _Particle();
                        particle.texture = cell.contents;
                        particle.size = (_b = (_a = cell.contents) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0.0;
                        particle.delay = Math.random() * 1000;
                        particle.maxLife =
                            (cell.lifttime +
                                -cell.lifttimeRange / 2.0 +
                                Math.random() * cell.lifttimeRange) *
                                1000;
                        var adjustRotation = new renderer_1._RotationAdjusting();
                        particle.position = renderer_1.RendererUtils.getPosition(emitter, adjustRotation);
                        var emissionLongitude = cell.emissionLongitude -
                            cell.emissionRange / 2.0 +
                            Math.random() * cell.emissionRange;
                        if (adjustRotation.value != 0.0) {
                            emissionLongitude += adjustRotation.value;
                        }
                        var theXPositionSpeed = cell.velocity -
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
    };
    CanvasRenderer.prototype.render = function () {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        for (var index = 0; index < this.allParticles.length; index++) {
            var element = this.allParticles[index];
            this.renderParticleItem(element);
        }
    };
    CanvasRenderer.prototype.renderParticleItem = function (particle) {
        var currentTime = this.currentTime - particle.startLife;
        var texture = particle.texture;
        if (!texture)
            return;
        var startTime = particle.startLife;
        var endTime = particle.startLife + particle.maxLife;
        if (particle.repeat) {
            var nTime = this.currentTime - startTime;
            var segTime = endTime - startTime;
            currentTime = nTime - Math.floor(nTime / segTime) * segTime;
        }
        else if (currentTime < 0.0 || currentTime > endTime) {
            return;
        }
        var currentScale = particle.scale + particle.scaleSpeed * (currentTime / 1000.0);
        var currentPosition = {
            x: particle.position.x +
                particle.velocity.x * (currentTime / 1000.0) +
                0.5 *
                    particle.acceleration.x *
                    (currentTime / 1000.0) *
                    (currentTime / 1000.0),
            y: particle.position.y +
                particle.velocity.y * (currentTime / 1000.0) +
                0.5 *
                    particle.acceleration.y *
                    (currentTime / 1000.0) *
                    (currentTime / 1000.0),
        };
        var currentRotation = particle.rotation + particle.rotationSpeed * (currentTime / 1000.0);
        var currentAlpha = particle.alpha + particle.alphaSpeed * (currentTime / 1000.0);
        this.context.save();
        this.context.translate(particle.texture.width / 2.0, particle.texture.height / 2.0);
        this.context.translate(currentPosition.x, currentPosition.y);
        this.context.rotate(currentRotation);
        this.context.scale(Math.abs(currentScale), Math.abs(currentScale));
        this.context.translate(-particle.texture.width / 2.0, -particle.texture.height / 2.0);
        this.context.globalAlpha = Math.max(0.0, Math.min(1.0, currentAlpha));
        this.context.drawImage(texture, 0, 0, texture.width, texture.height, 0, 0, particle.size, particle.size);
        this.context.restore();
    };
    CanvasRenderer.prototype.addParticle = function (particle) {
        var index = this.allParticles.length;
        var deathKeys = Object.keys(this.deathRange);
        for (var nIndex = 0; nIndex < deathKeys.length; nIndex++) {
            var deathKey = parseInt(deathKeys[nIndex]);
            if (deathKey < this.currentTime) {
                if (this.deathRange[deathKey].length > 0) {
                    index = this.deathRange[deathKey].shift();
                    break;
                }
                else {
                    delete this.deathRange[deathKey];
                }
            }
        }
        particle.startLife = this.currentTime + particle.delay;
        if (particle.alphaSpeed < 0.0) {
            var alphaLife = (0.0 - particle.alpha / particle.alphaSpeed) * 1000;
            particle.maxLife = Math.min(particle.maxLife, alphaLife);
        }
        if (!particle.repeat) {
            var deathRangeIndex = particle.startLife +
                particle.maxLife -
                ((particle.startLife + particle.maxLife) % 1000) +
                1000;
            if (!this.deathRange[deathRangeIndex]) {
                this.deathRange[deathRangeIndex] = [];
            }
            this.deathRange[deathRangeIndex].push(index);
        }
        this.allParticles[index] = particle;
    };
    return CanvasRenderer;
}());
exports.CanvasRenderer = CanvasRenderer;
var _Particle = /** @class */ (function () {
    function _Particle() {
        this.size = 0;
        this.delay = 0;
        this.startLife = 0;
        this.maxLife = 0;
        this.repeat = false;
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.scale = 1;
        this.scaleSpeed = 0;
        this.alpha = 1;
        this.alphaSpeed = 0;
        this.rotation = 0;
        this.rotationSpeed = 0;
    }
    return _Particle;
}());
