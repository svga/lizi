// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.

import { Offset } from "./types";

export class Cell {
  constructor(readonly identifier: string) {}

  birthRate: number = 1;

  contents?: HTMLImageElement;

  lifttime: number = 0;
  lifttimeRange: number = 0;

  velocity: number = 0;
  velocityRange: number = 0;

  alphaSpeed: number = 0;
  alphaRange: number = 0;

  acceleration: Offset = { x: 0, y: 0 };

  scale: number = 1.0;
  scaleSpeed: number = 0.0;
  scaleRange: number = 0.0;

  emissionLongitude: number = 0.0;
  emissionRange: number = 0.0;

  spin: number = 0.0;
  spinRange: number = 0.0;
}
