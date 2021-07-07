"use strict";
// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmitterMode = exports.EmitterShape = void 0;
var EmitterShape;
(function (EmitterShape) {
    EmitterShape[EmitterShape["point"] = 0] = "point";
    EmitterShape[EmitterShape["line"] = 1] = "line";
    EmitterShape[EmitterShape["rectangle"] = 2] = "rectangle";
    EmitterShape[EmitterShape["circle"] = 3] = "circle";
    EmitterShape[EmitterShape["cuboid"] = 4] = "cuboid";
    EmitterShape[EmitterShape["sphere"] = 5] = "sphere";
})(EmitterShape = exports.EmitterShape || (exports.EmitterShape = {}));
var EmitterMode;
(function (EmitterMode) {
    EmitterMode[EmitterMode["points"] = 0] = "points";
    EmitterMode[EmitterMode["outline"] = 1] = "outline";
    EmitterMode[EmitterMode["surface"] = 2] = "surface";
    EmitterMode[EmitterMode["volume"] = 3] = "volume";
})(EmitterMode = exports.EmitterMode || (exports.EmitterMode = {}));
