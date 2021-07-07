// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.

package com.ponycui.lizi;

import android.graphics.Canvas;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.Rect;

import java.util.ArrayList;

public class Emitter {
    public Offset emitterPosition = new Offset(0, 0);
    public Size emitterSize = new Size(0, 0);
    public EmitterShape emitterShape = EmitterShape.point;
    public EmitterMode emitterMode = EmitterMode.surface;
    public double birthRate = 1;
    public ArrayList<Cell> cells = new ArrayList();
}
