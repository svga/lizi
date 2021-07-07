"use strict";
// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cell = void 0;
var Cell = /** @class */ (function () {
    function Cell(identifier) {
        this.identifier = identifier;
        this.birthRate = 1;
        this.lifttime = 0;
        this.lifttimeRange = 0;
        this.velocity = 0;
        this.velocityRange = 0;
        this.alphaSpeed = 0;
        this.alphaRange = 0;
        this.acceleration = { x: 0, y: 0 };
        this.scale = 1.0;
        this.scaleSpeed = 0.0;
        this.scaleRange = 0.0;
        this.emissionLongitude = 0.0;
        this.emissionRange = 0.0;
        this.spin = 0.0;
        this.spinRange = 0.0;
    }
    return Cell;
}());
exports.Cell = Cell;
