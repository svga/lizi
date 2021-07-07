// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.

import 'dart:convert';
import 'dart:math';
import 'dart:typed_data';
import 'dart:ui';

class Cell {
  static Cell circle({
    required double radius,
    required Paint paint,
  }) {
    final cell = Cell(Random().nextDouble().toString());
    final pictureRecorder = PictureRecorder();
    final canvas = Canvas(pictureRecorder);
    canvas.drawCircle(
      Offset(radius, radius),
      radius,
      paint,
    );
    pictureRecorder
        .endRecording()
        .toImage((radius * 2).toInt(), (radius * 2).toInt())
        .then((value) {
      cell.contents = value;
    });
    return cell;
  }

  String identifier;

  Cell(this.identifier);

  double birthRate = 1;

  Image? _contents;

  Image? get contents => _contents;

  set contents(Image? contents) {
    _contents = contents;
    if (contents != null) {
      contents.toByteData(format: ImageByteFormat.png).then((value) {
        contentsBytes = value?.buffer.asUint8List();
      });
    } else {
      contentsBytes = null;
    }
  }

  Uint8List? contentsBytes;

  double lifttime = 0;
  double lifttimeRange = 0;

  double velocity = 0;
  double velocityRange = 0;

  double alphaSpeed = 0;
  double alphaRange = 0;

  Offset acceleration = Offset.zero;

  double scale = 1.0;
  double scaleSpeed = 0.0;
  double scaleRange = 0.0;

  double emissionLongitude = 0.0;
  double emissionRange = 0.0;

  double spin = 0.0;
  double spinRange = 0.0;

  // Decoder

  static Cell decodeFromMap(Map e) {
    final cell = Cell(e['identifier'])
      ..identifier = e['identifier']
      ..birthRate = e['birthRate']
      ..lifttime = e['lifttime']
      ..lifttimeRange = e['lifttimeRange']
      ..velocity = e['velocity']
      ..velocityRange = e['velocityRange']
      ..alphaSpeed = e['alphaSpeed']
      ..alphaRange = e['alphaRange']
      ..acceleration = Offset(e['acceleration']['x'], e['acceleration']['y'])
      ..scale = e['scale']
      ..scaleSpeed = e['scaleSpeed']
      ..scaleRange = e['scaleRange']
      ..emissionLongitude = e['emissionLongitude']
      ..emissionRange = e['emissionRange']
      ..spin = e['spin']
      ..spinRange = e['spinRange'];
    // decodeImageFromList(base64.decode(e['contents'])).then((value) {
    //   cell.contents = value;
    // });
    return cell;
  }

  // Encoder

  Map toJson() {
    return {
      'identifier': identifier,
      'birthRate': birthRate,
      'contents': contentsBytes != null ? base64.encode(contentsBytes!) : null,
      'lifttime': lifttime,
      'lifttimeRange': lifttimeRange,
      'velocity': velocity,
      'velocityRange': velocityRange,
      'alphaSpeed': alphaSpeed,
      'alphaRange': alphaRange,
      'acceleration': {'x': acceleration.dx, 'y': acceleration.dy},
      'scale': scale,
      'scaleSpeed': scaleSpeed,
      'scaleRange': scaleRange,
      'emissionLongitude': emissionLongitude,
      'emissionRange': emissionRange,
      'spin': spin,
      'spinRange': spinRange,
    };
  }
}
