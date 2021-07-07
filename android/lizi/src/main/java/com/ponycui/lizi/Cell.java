// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.

package com.ponycui.lizi;

import android.graphics.Bitmap;

public class Cell {

    public String identifier;

    public Cell(String identifier) {
        this.identifier = identifier;
    }

    public double birthRate = 1;

    public Bitmap contents;

    public double lifttime = 0;
    public double lifttimeRange = 0;

    public double velocity = 0;
    public double velocityRange = 0;

    public double alphaSpeed = 0;
    public double alphaRange = 0;

    public Offset acceleration = new Offset(0,0);

    public double scale = 1.0;
    public double scaleSpeed = 0.0;
    public double scaleRange = 0.0;

    public double emissionLongitude = 0.0;
    public double emissionRange = 0.0;

    public double spin = 0.0;
    public double spinRange = 0.0;

}
