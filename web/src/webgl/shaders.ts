// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.

export const vs = `

// vec2(startTime, endTime, repeat)
attribute vec3 a_life;
// vec4(layout.x, layout.y, position.x, position.y)
attribute vec4 a_position;
attribute vec2 a_texCoord;
// vec4(velocity.x, velocity.y, acceleration.x, acceleration.y)
attribute vec4 a_speed;
// vec3(alpha, alphaSpeed, textureId)
attribute vec3 a_alpha;
// vec2(scale, scaleSpeed)
attribute vec2 a_scale;
// vec2(rotation, rotationSpeed)
attribute vec2 a_rotation;
uniform vec2 u_resolution;
uniform float u_time;
varying float v_alpha;
varying float v_textureId;
varying vec2 v_texCoord;

void main() {
  float currentTime = u_time - a_life.x;

  if (a_life.z > 0.0) {
    float nTime = u_time - a_life.x;
    float segTime = a_life.y - a_life.x;
    currentTime = nTime - floor(nTime / segTime) * segTime;
  }
  else if (currentTime < 0.0 || currentTime > a_life.y) {
    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }

  vec2 currentScale = vec2(a_scale.x + a_scale.y * (currentTime / 1000.0), a_scale.x + a_scale.y * (currentTime / 1000.0));
  vec2 currentSpeed = a_speed.xy + a_speed.zw * (currentTime / 1000.0);
  float currentRotation = a_rotation.x + a_rotation.y * (currentTime / 1000.0);
  float currentAlpha = a_alpha.x + a_alpha.y * (currentTime / 1000.0);

  vec2 rotatedPosition = vec2(
      cos(currentRotation) * a_position.x - sin(currentRotation) * a_position.y,
      sin(currentRotation) * a_position.x + cos(currentRotation) * a_position.y);
  vec2 scaledPosition = rotatedPosition * currentScale;
  vec2 finalPositioned = scaledPosition + vec2(a_position.zw) + currentSpeed * (currentTime / 1000.0);

  vec2 zeroToOne = (finalPositioned.xy) / u_resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  v_alpha = currentAlpha;
  v_textureId = a_alpha.z;
  v_texCoord = a_texCoord;
}
`;

export const fs = `
precision mediump float;
varying float v_alpha;
varying float v_textureId;
varying vec2 v_texCoord;
uniform sampler2D u_textures[16];

void main() {
  int textureId = int(v_textureId);

  if (textureId == 0) { gl_FragColor = texture2D(u_textures[0], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }
  else if (textureId == 1) { gl_FragColor = texture2D(u_textures[1], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }
  else if (textureId == 2) { gl_FragColor = texture2D(u_textures[2], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }
  else if (textureId == 3) { gl_FragColor = texture2D(u_textures[3], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }
  else if (textureId == 4) { gl_FragColor = texture2D(u_textures[4], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }
  else if (textureId == 5) { gl_FragColor = texture2D(u_textures[5], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }
  else if (textureId == 6) { gl_FragColor = texture2D(u_textures[6], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }
  else if (textureId == 7) { gl_FragColor = texture2D(u_textures[7], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }
  else if (textureId == 8) { gl_FragColor = texture2D(u_textures[8], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }
  else if (textureId == 9) { gl_FragColor = texture2D(u_textures[9], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }
  else if (textureId == 10) { gl_FragColor = texture2D(u_textures[10], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }
  else if (textureId == 11) { gl_FragColor = texture2D(u_textures[11], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }
  else if (textureId == 12) { gl_FragColor = texture2D(u_textures[12], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }
  else if (textureId == 13) { gl_FragColor = texture2D(u_textures[13], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }
  else if (textureId == 14) { gl_FragColor = texture2D(u_textures[14], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }
  else if (textureId == 15) { gl_FragColor = texture2D(u_textures[15], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }
  else { gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); }
}
`;
