"use strict";
// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.
Object.defineProperty(exports, "__esModule", { value: true });
exports._RotationAdjusting = exports.RendererUtils = void 0;
var types_1 = require("./types");
var RendererUtils = /** @class */ (function () {
    function RendererUtils() {
    }
    RendererUtils.getPosition = function (emitter, adjustRotation) {
        if (emitter.emitterShape == types_1.EmitterShape.point) {
            return emitter.emitterPosition;
        }
        else if (emitter.emitterShape == types_1.EmitterShape.rectangle ||
            emitter.emitterShape == types_1.EmitterShape.cuboid) {
            if (emitter.emitterMode == types_1.EmitterMode.surface) {
                return {
                    x: emitter.emitterPosition.x -
                        emitter.emitterSize.width / 2.0 +
                        Math.random() * emitter.emitterSize.width,
                    y: emitter.emitterPosition.y -
                        emitter.emitterSize.height / 2.0 +
                        Math.random() * emitter.emitterSize.height,
                };
            }
            else if (emitter.emitterMode == types_1.EmitterMode.points) {
                return {
                    x: emitter.emitterPosition.x -
                        emitter.emitterSize.width / 2.0 +
                        Math.round(Math.random()) * emitter.emitterSize.width,
                    y: emitter.emitterPosition.y -
                        emitter.emitterSize.height / 2.0 +
                        Math.round(Math.random()) * emitter.emitterSize.height,
                };
            }
            else if (emitter.emitterMode == types_1.EmitterMode.outline) {
                if (Math.random() < 0.5) {
                    var yValue = Math.round(Math.random());
                    if (yValue == 0) {
                        adjustRotation.value = Math.PI * 1.5;
                    }
                    else {
                        adjustRotation.value = Math.PI * -1.5;
                    }
                    return {
                        x: emitter.emitterPosition.x -
                            emitter.emitterSize.width / 2.0 +
                            Math.random() * emitter.emitterSize.width,
                        y: emitter.emitterPosition.y -
                            emitter.emitterSize.height / 2.0 +
                            yValue * emitter.emitterSize.height,
                    };
                }
                else {
                    var xValue = Math.round(Math.random());
                    if (xValue == 0) {
                        adjustRotation.value = Math.PI * 1.0;
                    }
                    else {
                        adjustRotation.value = 0.0;
                    }
                    return {
                        x: emitter.emitterPosition.x -
                            emitter.emitterSize.width / 2.0 +
                            xValue * emitter.emitterSize.width,
                        y: emitter.emitterPosition.y -
                            emitter.emitterSize.height / 2.0 +
                            Math.random() * emitter.emitterSize.height,
                    };
                }
            }
            else {
                return {
                    x: emitter.emitterPosition.x -
                        emitter.emitterSize.width / 2.0 +
                        Math.random() * emitter.emitterSize.width,
                    y: emitter.emitterPosition.y -
                        emitter.emitterSize.height / 2.0 +
                        Math.random() * emitter.emitterSize.height,
                };
            }
        }
        else if (emitter.emitterShape == types_1.EmitterShape.circle ||
            emitter.emitterShape == types_1.EmitterShape.sphere) {
            if (emitter.emitterMode == types_1.EmitterMode.surface) {
                var t = Math.PI * 2 * Math.random();
                var x = ((Math.random() * emitter.emitterSize.width) / 2.0) * Math.cos(t);
                var y = ((Math.random() * emitter.emitterSize.height) / 2.0) * Math.sin(t);
                return {
                    x: emitter.emitterPosition.x + x,
                    y: emitter.emitterPosition.y + y,
                };
            }
            else if (emitter.emitterMode == types_1.EmitterMode.points) {
                return emitter.emitterPosition;
            }
            else if (emitter.emitterMode == types_1.EmitterMode.outline) {
                var t = Math.PI * 2 * Math.random();
                var x = (emitter.emitterSize.width / 2.0) * Math.cos(t);
                var y = (emitter.emitterSize.height / 2.0) * Math.sin(t);
                adjustRotation.value = t;
                return {
                    x: emitter.emitterPosition.x + x,
                    y: emitter.emitterPosition.y + y,
                };
            }
            else {
                var t = Math.PI * 2 * Math.random();
                var x = ((Math.random() * emitter.emitterSize.width) / 2.0) * Math.cos(t);
                var y = ((Math.random() * emitter.emitterSize.height) / 2.0) * Math.sin(t);
                return {
                    x: emitter.emitterPosition.x + x,
                    y: emitter.emitterPosition.y + y,
                };
            }
        }
        else {
            return emitter.emitterPosition;
        }
    };
    return RendererUtils;
}());
exports.RendererUtils = RendererUtils;
var _RotationAdjusting = /** @class */ (function () {
    function _RotationAdjusting() {
        this.value = 0;
    }
    return _RotationAdjusting;
}());
exports._RotationAdjusting = _RotationAdjusting;
