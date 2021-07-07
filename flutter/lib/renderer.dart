// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.

import 'dart:math';
import 'dart:ui';

import 'package:flutter/widgets.dart' hide Image;
import 'package:lizi/player.dart';

import 'emitter.dart';
import 'types.dart';

class Renderer extends StatefulWidget {
  final LiziPlayerController liziPlayerController;

  const Renderer({Key? key, required this.liziPlayerController})
      : super(key: key);

  @override
  _RendererState createState() => _RendererState();
}

class _RendererState extends State<Renderer>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  int _currentTime = 0;
  int _birthedTime = -1;
  final Map<int, _ParticleGroup> _particleGroups = {};
  final Map<int, Image> _particleGroupsImage = {};

  @override
  void dispose() {
    _animationController.dispose();
    widget.liziPlayerController.removeListener(_onPlayStateChanged);
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(vsync: this);
    _animationController.addListener(() {
      _onTick();
    });
    widget.liziPlayerController.addListener(_onPlayStateChanged);
    _onPlayStateChanged();
  }

  @override
  void didUpdateWidget(covariant Renderer oldWidget) {
    super.didUpdateWidget(oldWidget);
    oldWidget.liziPlayerController.removeListener(_onPlayStateChanged);
    widget.liziPlayerController.addListener(_onPlayStateChanged);
  }

  void _onPlayStateChanged() {
    if (widget.liziPlayerController.running) {
      _animationController.value = 0.0;
      _animationController.animateTo(1.0, duration: Duration(seconds: 8640000));
    } else {
      _animationController.stop();
    }
  }

  void _onTick() {
    _currentTime = DateTime.now().millisecondsSinceEpoch;
    _birth();
    setState(() {});
  }

  void _birth() {
    if (_birthedTime < 0 || _birthedTime + 1000 < _currentTime) {
      _birthedTime = _currentTime;
      for (final emitter in widget.liziPlayerController.emitters) {
        for (final cell in emitter.cells) {
          if (cell.contents == null) {
            break;
          }
          final cellBirthRate = emitter.birthRate * cell.birthRate;
          for (var i = 0; i < cellBirthRate; i++) {
            final particle = _Particle();
            particle.size = cell.contents?.width.toDouble() ?? 0.0;
            particle.delay = Random().nextInt(1000);
            particle.maxLife = ((cell.lifttime -
                        cell.lifttimeRange / 2.0 +
                        Random().nextDouble() * cell.lifttimeRange) *
                    1000)
                .toInt();
            final adjustRotation = _RotationAdjusting();
            particle.position = getPosition(emitter, adjustRotation);
            var emissionLongitude = cell.emissionLongitude -
                cell.emissionRange / 2.0 +
                Random().nextDouble() * cell.emissionRange;

            if (adjustRotation.value != 0.0) {
              emissionLongitude += adjustRotation.value;
            }
            final theXPositionSpeed = cell.velocity -
                cell.velocityRange / 2.0 +
                Random().nextDouble() * cell.velocityRange;
            particle.velocity = Offset(
              theXPositionSpeed * cos(emissionLongitude),
              theXPositionSpeed * sin(emissionLongitude),
            );
            particle.acceleration = cell.acceleration;
            particle.scale = cell.scale -
                cell.scaleRange / 2 +
                Random().nextDouble() * cell.scaleRange;
            particle.scaleSpeed = cell.scaleSpeed;
            particle.alpha = 1.0 -
                cell.alphaRange / 2.0 +
                Random().nextDouble() * cell.alphaRange;
            particle.alphaSpeed = cell.alphaSpeed;
            particle.rotation = 0.0;
            particle.rotationSpeed = cell.spin -
                cell.spinRange / 2 +
                Random().nextDouble() * cell.spinRange;
            if (!_particleGroups.containsKey(cell.contents.hashCode)) {
              _particleGroups[cell.contents.hashCode] = _ParticleGroup();
              _particleGroupsImage[cell.contents.hashCode] = cell.contents!;
            }
            _particleGroups[cell.contents.hashCode]!.addParticle(
              particle,
              _currentTime,
            );
          }
        }
      }
    }
  }

  Offset getPosition(Emitter emitter, _RotationAdjusting adjustRotation) {
    if (emitter.emitterShape == EmitterShape.point) {
      return emitter.emitterPosition;
    } else if (emitter.emitterShape == EmitterShape.rectangle ||
        emitter.emitterShape == EmitterShape.cuboid) {
      if (emitter.emitterMode == EmitterMode.surface) {
        return Offset(
          emitter.emitterPosition.dx -
              emitter.emitterSize.width / 2.0 +
              Random().nextDouble() * emitter.emitterSize.width,
          emitter.emitterPosition.dy -
              emitter.emitterSize.height / 2.0 +
              Random().nextDouble() * emitter.emitterSize.height,
        );
      } else if (emitter.emitterMode == EmitterMode.points) {
        return Offset(
          emitter.emitterPosition.dx -
              emitter.emitterSize.width / 2.0 +
              (Random().nextDouble()).roundToDouble() *
                  emitter.emitterSize.width,
          emitter.emitterPosition.dy -
              emitter.emitterSize.height / 2.0 +
              (Random().nextDouble()).roundToDouble() *
                  emitter.emitterSize.height,
        );
      } else if (emitter.emitterMode == EmitterMode.outline) {
        if (Random().nextDouble() < 0.5) {
          final yValue = (Random().nextDouble()).roundToDouble();
          if (yValue == 0) {
            adjustRotation.value = pi * 1.5;
          } else {
            adjustRotation.value = pi * -1.5;
          }
          return Offset(
            emitter.emitterPosition.dx -
                emitter.emitterSize.width / 2.0 +
                Random().nextDouble() * emitter.emitterSize.width,
            emitter.emitterPosition.dy -
                emitter.emitterSize.height / 2.0 +
                yValue * emitter.emitterSize.height,
          );
        } else {
          final xValue = (Random().nextDouble()).roundToDouble();
          if (xValue == 0) {
            adjustRotation.value = pi * 1.0;
          } else {
            adjustRotation.value = 0.0;
          }
          return Offset(
            emitter.emitterPosition.dx -
                emitter.emitterSize.width / 2.0 +
                xValue * emitter.emitterSize.width,
            emitter.emitterPosition.dy -
                emitter.emitterSize.height / 2.0 +
                Random().nextDouble() * emitter.emitterSize.height,
          );
        }
      } else {
        return Offset(
          emitter.emitterPosition.dx -
              emitter.emitterSize.width / 2.0 +
              Random().nextDouble() * emitter.emitterSize.width,
          emitter.emitterPosition.dy -
              emitter.emitterSize.height / 2.0 +
              Random().nextDouble() * emitter.emitterSize.height,
        );
      }
    } else if (emitter.emitterShape == EmitterShape.circle ||
        emitter.emitterShape == EmitterShape.sphere) {
      if (emitter.emitterMode == EmitterMode.surface) {
        final t = pi * 2 * Random().nextDouble();
        final x = ((Random().nextDouble() * emitter.emitterSize.width) / 2.0) *
            cos(t);
        final y = ((Random().nextDouble() * emitter.emitterSize.height) / 2.0) *
            sin(t);
        return Offset(
          emitter.emitterPosition.dx + x,
          emitter.emitterPosition.dy + y,
        );
      } else if (emitter.emitterMode == EmitterMode.points) {
        return emitter.emitterPosition;
      } else if (emitter.emitterMode == EmitterMode.outline) {
        final t = pi * 2 * Random().nextDouble();
        final x = (emitter.emitterSize.width / 2.0) * cos(t);
        final y = (emitter.emitterSize.height / 2.0) * sin(t);
        adjustRotation.value = t;
        return Offset(
          emitter.emitterPosition.dx + x,
          emitter.emitterPosition.dy + y,
        );
      } else {
        final t = pi * 2 * Random().nextDouble();
        final x = ((Random().nextDouble() * emitter.emitterSize.width) / 2.0) *
            cos(t);
        final y = ((Random().nextDouble() * emitter.emitterSize.height) / 2.0) *
            sin(t);
        return Offset(
          emitter.emitterPosition.dx + x,
          emitter.emitterPosition.dy + y,
        );
      }
    } else {
      return emitter.emitterPosition;
    }
  }

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _Painter(
        currentTime: _currentTime,
        particleGroups: _particleGroups,
        particleGroupsImage: _particleGroupsImage,
      ),
    );
  }
}

class _ParticleGroup {
  final List<_Particle> allParticles = [];
  final Map<int, List<int>> deathRange = {};

  void addParticle(_Particle model, int currentTime) {
    var index = allParticles.length;
    final deathKeys = deathRange.keys.toList();
    for (final deathKey in deathKeys) {
      if (deathKey < currentTime) {
        if (deathRange[deathKey]!.length > 0) {
          index = deathRange[deathKey]!.removeAt(0);
          break;
        } else {
          deathRange.remove(deathKey);
        }
      }
    }
    model.startLife = currentTime + model.delay;
    if (model.alphaSpeed < 0.0) {
      final alphaLife = ((0.0 - model.alpha / model.alphaSpeed) * 1000).toInt();
      model.maxLife = min(model.maxLife, alphaLife);
    }
    if (!model.repeat) {
      final deathRangeIndex = model.startLife +
          model.maxLife -
          ((model.startLife + model.maxLife) % 1000) +
          1000;
      if (!deathRange.containsKey(deathRangeIndex)) {
        deathRange[deathRangeIndex] = [];
      }
      deathRange[deathRangeIndex]!.add(index);
    }
    if (index < allParticles.length) {
      allParticles[index] = model;
    } else {
      allParticles.add(model);
    }
  }
}

class _Particle {
  double size = 0;
  int delay = 0;
  int startLife = 0;
  int maxLife = 0;
  bool repeat = false;
  Offset position = Offset.zero;
  Offset velocity = Offset.zero;
  Offset acceleration = Offset.zero;
  double scale = 1;
  double scaleSpeed = 0;
  double alpha = 1;
  double alphaSpeed = 0;
  double rotation = 0;
  double rotationSpeed = 0;
}

class _RotationAdjusting {
  double value = 0;
}

class _Painter extends CustomPainter {
  final int currentTime;
  final Map<int, _ParticleGroup> particleGroups;
  final Map<int, Image> particleGroupsImage;

  _Painter({
    required this.currentTime,
    required this.particleGroups,
    required this.particleGroupsImage,
  });

  @override
  void paint(Canvas canvas, Size size) {
    for (final particleGroup in particleGroups.entries) {
      final validParticles = particleGroup.value.allParticles.where((particle) {
        var itemCurrentTime = this.currentTime - particle.startLife;
        final endTime = particle.startLife + particle.maxLife;
        if (particle.repeat) {
          return true;
        } else if (itemCurrentTime < 0.0 || currentTime > endTime) {
          return false;
        }
        return true;
      }).toList();
      final positions = <Offset>[];
      final colors = <Color>[];
      final texCoords = <Offset>[];
      validParticles.forEach((particle) {
        var itemCurrentTime = this.currentTime - particle.startLife;
        final startTime = particle.startLife;
        final endTime = particle.startLife + particle.maxLife;
        if (particle.repeat) {
          final nTime = this.currentTime - startTime;
          final segTime = endTime - startTime;
          itemCurrentTime =
              (nTime - (nTime / segTime).floorToDouble() * segTime).toInt();
        } else if (currentTime < 0.0 || currentTime > endTime) {
          return;
        }
        final currentScale =
            particle.scale + particle.scaleSpeed * (itemCurrentTime / 1000.0);
        final currentPosition = Offset(
          particle.position.dx +
              particle.velocity.dx * (itemCurrentTime / 1000.0) +
              0.5 *
                  particle.acceleration.dx *
                  (itemCurrentTime / 1000.0) *
                  (itemCurrentTime / 1000.0),
          particle.position.dy +
              particle.velocity.dy * (itemCurrentTime / 1000.0) +
              0.5 *
                  particle.acceleration.dy *
                  (itemCurrentTime / 1000.0) *
                  (itemCurrentTime / 1000.0),
        );
        final currentRotation = particle.rotation +
            particle.rotationSpeed * (itemCurrentTime / 1000.0);
        final currentAlpha =
            particle.alpha + particle.alphaSpeed * (itemCurrentTime / 1000.0);
        positions.addAll([
          offsetWithParams(
            -particle.size / 2.0,
            -particle.size / 2.0,
            currentRotation,
            currentScale,
          ).translate(currentPosition.dx, currentPosition.dy),
          offsetWithParams(
            particle.size / 2.0,
            -particle.size / 2.0,
            currentRotation,
            currentScale,
          ).translate(currentPosition.dx, currentPosition.dy),
          offsetWithParams(
            particle.size / 2.0,
            particle.size / 2.0,
            currentRotation,
            currentScale,
          ).translate(currentPosition.dx, currentPosition.dy),
          offsetWithParams(
            -particle.size / 2.0,
            -particle.size / 2.0,
            currentRotation,
            currentScale,
          ).translate(currentPosition.dx, currentPosition.dy),
          offsetWithParams(
            particle.size / 2.0,
            particle.size / 2.0,
            currentRotation,
            currentScale,
          ).translate(currentPosition.dx, currentPosition.dy),
          offsetWithParams(
            -particle.size / 2.0,
            particle.size / 2.0,
            currentRotation,
            currentScale,
          ).translate(currentPosition.dx, currentPosition.dy),
        ]);
        colors.addAll([
          Color.fromARGB((currentAlpha * 255).toInt(), 255, 255, 255),
          Color.fromARGB((currentAlpha * 255).toInt(), 255, 255, 255),
          Color.fromARGB((currentAlpha * 255).toInt(), 255, 255, 255),
          Color.fromARGB((currentAlpha * 255).toInt(), 255, 255, 255),
          Color.fromARGB((currentAlpha * 255).toInt(), 255, 255, 255),
          Color.fromARGB((currentAlpha * 255).toInt(), 255, 255, 255),
        ]);
        texCoords.addAll([
          Offset(0, 0),
          Offset(particle.size, 0),
          Offset(particle.size, particle.size),
          Offset(0, 0),
          Offset(particle.size, particle.size),
          Offset(0, particle.size),
        ]);
      });
      final paint = Paint();
      paint.shader = ImageShader(
        particleGroupsImage[particleGroup.key]!,
        TileMode.clamp,
        TileMode.clamp,
        Matrix4.identity().storage,
      );
      paint.style = PaintingStyle.fill;
      canvas.drawVertices(
        Vertices(
          VertexMode.triangles,
          positions,
          colors: colors,
          textureCoordinates: texCoords,
        ),
        BlendMode.srcIn,
        paint,
      );
    }
  }

  Offset offsetWithParams(double x, double y, double rotation, double scale) {
    return Offset(
      (cos(rotation) * x - sin(rotation) * y) * scale,
      (sin(rotation) * x + cos(rotation) * y) * scale,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    if (!(oldDelegate is _Painter)) return true;
    return oldDelegate.currentTime != currentTime;
  }
}
