"use strict";
// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGLRenderer = void 0;
var renderer_1 = require("../renderer");
var shaders_1 = require("./shaders");
function resizeCanvasToDisplaySize(canvas) {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    var displayWidth = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;
    // Check if the canvas is not the same size.
    var needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;
    if (needResize) {
        // Make the canvas the same size
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
    return needResize;
}
var WebGLRenderer = /** @class */ (function () {
    function WebGLRenderer(canvas) {
        this.canvas = canvas;
        this.currentTime = 0;
        this.birthedTime = -1;
        this.bufferStore = {};
        this.emitterLayerModel = new _LayerModel();
        this.activeTextures = [];
        this.activeTexturesCache = {};
        this.emitters = [];
        this.gl = (canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl"));
        if (!this.gl)
            throw "Fail to get webgl context.";
        var vsShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(vsShader, shaders_1.vs);
        this.gl.compileShader(vsShader);
        var fsShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(fsShader, shaders_1.fs);
        this.gl.compileShader(fsShader);
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vsShader);
        this.gl.attachShader(this.program, fsShader);
        this.gl.linkProgram(this.program);
        this.lifeAttributeLocation = this.gl.getAttribLocation(this.program, "a_life");
        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position");
        this.texCoordAttributeLocation = this.gl.getAttribLocation(this.program, "a_texCoord");
        this.speedAttributeLocation = this.gl.getAttribLocation(this.program, "a_speed");
        this.alphaAttributeLocation = this.gl.getAttribLocation(this.program, "a_alpha");
        this.scaleAttributeLocation = this.gl.getAttribLocation(this.program, "a_scale");
        this.rotationAttributeLocation = this.gl.getAttribLocation(this.program, "a_rotation");
        this.resolutionUniformLocation = this.gl.getUniformLocation(this.program, "u_resolution");
        this.timeUniformLocation = this.gl.getUniformLocation(this.program, "u_time");
        this.texturesUniformLocation = this.gl.getUniformLocation(this.program, "u_textures");
        resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.useProgram(this.program);
        this.gl.uniform2f(this.resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);
    }
    WebGLRenderer.prototype.addEmitter = function (emitter) {
        this.emitters.push(emitter);
    };
    WebGLRenderer.prototype.removeEmitter = function (emitter) {
        var targetIndex = this.emitters.indexOf(emitter);
        if (targetIndex >= 0) {
            delete this.emitters[targetIndex];
        }
    };
    WebGLRenderer.prototype.removeAllEmitters = function () {
        this.emitters = [];
    };
    WebGLRenderer.prototype.onTick = function (time) {
        this.currentTime = time;
        this.gl.useProgram(this.program);
        this.gl.uniform1f(this.timeUniformLocation, this.currentTime);
        this.birth();
        this.render();
    };
    WebGLRenderer.prototype.createTexture = function (image) {
        var textureIndex = this.activeTextures.length;
        var texture = this.gl.createTexture();
        this.gl.activeTexture(this.gl.TEXTURE0 + textureIndex);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        this.activeTextures.push(textureIndex);
        var textureIds = [];
        for (var tIndex = 0; tIndex < textureIndex + 1; tIndex++) {
            textureIds.push(tIndex);
        }
        this.gl.uniform1iv(this.texturesUniformLocation, textureIds);
        return textureIndex;
    };
    WebGLRenderer.prototype.birth = function () {
        var _a, _b, _c;
        if (this.birthedTime < 0 || this.birthedTime + 1000 < this.currentTime) {
            for (var emitterIndex = 0; emitterIndex < this.emitters.length; emitterIndex++) {
                var emitter = this.emitters[emitterIndex];
                for (var cellIndex = 0; cellIndex < emitter.cells.length; cellIndex++) {
                    var cell = emitter.cells[cellIndex];
                    var cellBirthRate = emitter.birthRate * cell.birthRate;
                    if (!cell.contents || cell.contents.width <= 0)
                        continue;
                    for (var index = 0; index < cellBirthRate; index++) {
                        var particle = new _Particle();
                        particle.textureId = (_a = this.activeTexturesCache[cell.contents.src]) !== null && _a !== void 0 ? _a : this.createTexture(cell.contents);
                        this.activeTexturesCache[cell.contents.src] = particle.textureId;
                        particle.size = (_c = (_b = cell.contents) === null || _b === void 0 ? void 0 : _b.width) !== null && _c !== void 0 ? _c : 0.0;
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
                        this.emitterLayerModel.addParticle(particle, this.currentTime);
                    }
                }
            }
            this.birthedTime = this.currentTime;
        }
    };
    WebGLRenderer.prototype.render = function () {
        var _this = this;
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
            ].forEach(function (type) {
                var _a;
                var buffered = _this.bufferStore[type] !== undefined;
                var buffer = (_a = _this.bufferStore[type]) !== null && _a !== void 0 ? _a : _this.gl.createBuffer();
                _this.bufferStore[type] = buffer;
                _this.gl.bindBuffer(_this.gl.ARRAY_BUFFER, buffer);
                if (_this.emitterLayerModel.dirtyIndexes.length > 0 &&
                    _this.emitterLayerModel.dirtyIndexes.length <
                        _this.emitterLayerModel.numberOfParticles() / 3) {
                    _this.emitterLayerModel.dirtyIndexes.forEach(function (idx) {
                        var offset = 2 * 6 * idx;
                        var length = 2 * 6;
                        if (type === "speed" || type === "position") {
                            offset = 4 * 6 * idx;
                            length = 4 * 6;
                        }
                        else if (type === "life") {
                            offset = 3 * 6 * idx;
                            length = 3 * 6;
                        }
                        else if (type === "alpha") {
                            offset = 3 * 6 * idx;
                            length = 3 * 6;
                        }
                        var data = _this.emitterLayerModel[type].slice(offset, offset + length);
                        _this.gl.bufferSubData(_this.gl.ARRAY_BUFFER, offset * 4, new Float32Array(data));
                    });
                }
                else {
                    _this.gl.bufferData(_this.gl.ARRAY_BUFFER, new Float32Array(_this.emitterLayerModel[type]), _this.gl.DYNAMIC_DRAW);
                }
                if (!buffered) {
                    _this.gl.enableVertexAttribArray(_this[type + "AttributeLocation"]);
                    _this.gl.bindBuffer(_this.gl.ARRAY_BUFFER, buffer);
                    var count = 2;
                    if (type === "speed" || type === "position") {
                        count = 4;
                    }
                    else if (type === "life") {
                        count = 3;
                    }
                    else if (type === "alpha") {
                        count = 3;
                    }
                    _this.gl.vertexAttribPointer(_this[type + "AttributeLocation"], count, _this.gl.FLOAT, false, 0, 0);
                }
            });
            this.emitterLayerModel.dirtied = false;
            this.emitterLayerModel.dirtyIndexes = [];
        }
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.emitterLayerModel.numberOfParticles() * 6);
    };
    return WebGLRenderer;
}());
exports.WebGLRenderer = WebGLRenderer;
var _LayerModel = /** @class */ (function () {
    function _LayerModel() {
        this.allParticles = [];
        this.life = [];
        this.position = [];
        this.speed = [];
        this.alpha = [];
        this.scale = [];
        this.rotation = [];
        this.texCoord = [];
        this.deathRange = {};
        this.dirtied = true;
        this.dirtyIndexes = [];
    }
    _LayerModel.prototype.addParticle = function (model, currentTime) {
        this.dirtied = true;
        var needPush = true;
        var index = this.allParticles.length;
        var deathKeys = Object.keys(this.deathRange);
        for (var nIndex = 0; nIndex < deathKeys.length; nIndex++) {
            var deathKey = parseInt(deathKeys[nIndex]);
            if (deathKey < currentTime) {
                if (this.deathRange[deathKey].length > 0) {
                    index = this.deathRange[deathKey].shift();
                    this.dirtyIndexes.push(index);
                    needPush = false;
                    break;
                }
                else {
                    delete this.deathRange[deathKey];
                }
            }
        }
        if (needPush) {
            this.dirtyIndexes = [];
        }
        model.startLife = currentTime + model.delay;
        if (model.alphaSpeed < 0.0) {
            var alphaLife = (0.0 - model.alpha / model.alphaSpeed) * 1000;
            model.maxLife = Math.min(model.maxLife, alphaLife);
        }
        if (!model.repeat) {
            var deathRangeIndex = model.startLife +
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
        this.resetBufferData(this.texCoord, index * 12, [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]);
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
    };
    _LayerModel.prototype.resetBufferData = function (bufferData, offset, data) {
        for (var index = offset, dataIndex = 0; index < offset + data.length; index++, dataIndex++) {
            bufferData[index] = data[dataIndex];
        }
    };
    _LayerModel.prototype.numberOfParticles = function () {
        return this.allParticles.length;
    };
    return _LayerModel;
}());
var _Particle = /** @class */ (function () {
    function _Particle() {
        this.textureId = -1;
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
