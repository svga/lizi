"use strict";
// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Emitter = void 0;
var types_1 = require("./types");
var Emitter = /** @class */ (function () {
    function Emitter() {
        this.emitterPosition = { x: 0, y: 0 };
        this.emitterSize = { width: 0, height: 0 };
        this.emitterShape = types_1.EmitterShape.point;
        this.emitterMode = types_1.EmitterMode.surface;
        this.birthRate = 1;
        this.cells = [];
    }
    return Emitter;
}());
exports.Emitter = Emitter;
