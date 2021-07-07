// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.

import { Cell } from "./cell";
import { EmitterMode, EmitterShape, Offset, Size } from "./types";

export class Emitter {
  emitterPosition: Offset = { x: 0, y: 0 };
  emitterSize: Size = { width: 0, height: 0 };
  emitterShape: EmitterShape = EmitterShape.point;
  emitterMode: EmitterMode = EmitterMode.surface;
  birthRate: number = 1;
  cells: Cell[] = [];
}
