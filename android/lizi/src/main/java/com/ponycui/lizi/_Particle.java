// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.

package com.ponycui.lizi;

import android.graphics.Bitmap;

import java.util.Random;

class _Particle {
    Bitmap texture;
    int textureId = -1;
    boolean repeat = false;
    double startLife = 0;
    double maxLife = 0;
    double delay = 0;
    Offset position = new Offset(0, 0);
    double alpha = 1.0;
    double alphaSpeed = 0.0;
    Offset velocity = new Offset(0, 0);
    Offset acceleration = new Offset(0, 0);
    double scale = 1.0;
    double scaleSpeed = 0.0;
    double rotation = 0.0;
    double rotationSpeed = 0.0;
    double size = 0.0;
}
