// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.

export enum EmitterShape {
  point,
  line,
  rectangle,
  circle,
  cuboid,
  sphere,
}

export enum EmitterMode {
  points,
  outline,
  surface,
  volume,
}

export interface Offset {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}
