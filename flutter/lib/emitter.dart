// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.

import 'dart:ui';

import 'package:lizi/types.dart';

import 'cell.dart';

class Emitter {
  Offset emitterPosition = Offset(0, 0);
  Size emitterSize = Size(0, 0);
  EmitterShape emitterShape = EmitterShape.point;
  EmitterMode emitterMode = EmitterMode.surface;
  double birthRate = 1;
  List<Cell> cells = [];

  // Decoder

  static Emitter decodeFromMap(Map e) {
    return Emitter()
      ..emitterPosition =
          Offset(e['emitterPosition']['x'], e['emitterPosition']['y'])
      ..emitterSize = Size(e['emitterSize']['w'], e['emitterSize']['h'])
      ..emitterShape = (() {
        switch (e['emitterShape'] as String) {
          case 'point':
            return EmitterShape.point;
          case 'line':
            return EmitterShape.line;
          case 'rectangle':
            return EmitterShape.rectangle;
          case 'circle':
            return EmitterShape.circle;
          case 'cuboid':
            return EmitterShape.cuboid;
          case 'sphere':
            return EmitterShape.sphere;
          default:
            return EmitterShape.point;
        }
      })()
      ..emitterMode = (() {
        switch (e['emitterMode'] as String) {
          case 'surface':
            return EmitterMode.surface;
          case 'points':
            return EmitterMode.points;
          case 'outline':
            return EmitterMode.outline;
          case 'volume':
            return EmitterMode.volume;
          default:
            return EmitterMode.surface;
        }
      })()
      ..birthRate = e['birthRate']
      ..cells = (e['cells'] as List)
          .map((cell) => Cell.decodeFromMap(cell))
          .toList()
          .cast();
  }

  // Encoder

  Map toJson() {
    return {
      'emitterPosition': {'x': emitterPosition.dx, 'y': emitterPosition.dy},
      'emitterSize': {'w': emitterSize.width, 'h': emitterSize.height},
      'emitterShape': emitterShape.toString().replaceAll('EmitterShape.', ''),
      'emitterMode': emitterMode.toString().replaceAll('EmitterMode.', ''),
      'birthRate': birthRate,
      'cells': cells,
    };
  }

  // Implements
  // List<_Particle> _particles = [];

  // void update(int ms) {
  //   for (var cell in cells) {
  //     final cellBirthRate = birthRate * cell.birthRate;
  //     if (DateTime.now().millisecondsSinceEpoch - cell._birthedStart >= 1000) {
  //       cell._birthedStart = DateTime.now().millisecondsSinceEpoch;
  //       cell._birthedCount = 0;
  //     } else if (cell._birthedNext > DateTime.now().millisecondsSinceEpoch) {
  //       continue;
  //     } else if (cell._birthedCount >= cellBirthRate) {
  //       continue;
  //     }
  //     final currentNumberOfBirths =
  //         (cellBirthRate / (1000 / ms).toDouble()).ceil();
  //     for (var i = 0; i < currentNumberOfBirths; i++) {
  //       _makeParticle(cell);
  //       cell._birthedCount++;
  //     }
  //     cell._birthedNext =
  //         DateTime.now().millisecondsSinceEpoch + 1000 ~/ cellBirthRate;
  //   }
  //   for (var particle in _particles) {
  //     particle.update(ms);
  //   }
  // }

  // void _makeParticle(Cell cell) {
  //   for (var particle in _particles) {
  //     if (!particle.alive && particle.cellIdentifier == cell.identifier) {
  //       particle.relive(this, cell);
  //       return;
  //     }
  //   }
  //   final newParticle = _Particle(cell.identifier);
  //   newParticle.relive(this, cell);
  //   _particles.add(newParticle);
  // }

  // void draw(Canvas canvas) {
  //   for (var item in _particles) {
  //     if (item.alive && item.contents != null) {
  //       canvas.save();
  //       final matrix = Matrix4.identity();
  //       matrix.translate(
  //         item.contents!.width.toDouble() / 2.0,
  //         item.contents!.height.toDouble() / 2.0,
  //       );
  //       matrix.translate(item.position.dx, item.position.dy);
  //       matrix.setRotationZ(item.rotation);
  //       matrix.scale(item.scale.abs());
  //       matrix.translate(
  //         -item.contents!.width.toDouble() / 2.0,
  //         -item.contents!.height.toDouble() / 2.0,
  //       );
  //       canvas.transform(matrix.storage);
  //       canvas.drawImageRect(
  //         item.contents!,
  //         Rect.fromLTWH(
  //           0,
  //           0,
  //           item.contents!.width.toDouble(),
  //           item.contents!.height.toDouble(),
  //         ),
  //         Rect.fromLTWH(
  //           0,
  //           0,
  //           item.contents!.width.toDouble(),
  //           item.contents!.height.toDouble(),
  //         ),
  //         Paint()
  //           ..color = Color.fromARGB(
  //             (max(0.0, min(1.0, item.alpha)) * 255.0).toInt(),
  //             255,
  //             255,
  //             255,
  //           ),
  //       );
  //       canvas.restore();
  //     }
  //   }
  // }
}
