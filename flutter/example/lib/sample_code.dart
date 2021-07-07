import 'dart:convert';
import 'dart:io';
import 'dart:math';
import 'dart:typed_data';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lizi/lizi.dart';

class SampleCodePage extends StatefulWidget {
  SampleCodePage();

  @override
  _SampleCodePageState createState() => _SampleCodePageState();
}

class _SampleCodePageState extends State<SampleCodePage> {
  late Emitter emitter;
  late Cell cell;
  late LiziPlayerController controller;

  Future loadIconRound() async {
    final bytes = await rootBundle.load('images/icon_round.png');
    final img = await decodeImageFromList(bytes.buffer.asUint8List());
    cell.contents = img;
    controller.start();
  }

  @override
  void initState() {
    super.initState();

    controller = LiziPlayerController();

    emitter = Emitter();
    emitter.emitterPosition = Offset(375 / 2.0, 667.0);
    emitter.emitterSize = Size(375, 1);
    emitter.emitterShape = EmitterShape.rectangle;
    emitter.emitterMode = EmitterMode.surface;
    emitter.birthRate = 4;

    cell = Cell.circle(
      radius: 10,
      paint: Paint()
        ..shader = RadialGradient(
          colors: [
            Colors.yellow,
            Colors.yellow.withOpacity(0.0),
          ],
        ).createShader(Rect.fromCircle(center: Offset(10, 10), radius: 10)),
    );
    cell.birthRate = 10;
    cell.lifttime = 10;
    cell.lifttimeRange = 0.5;
    cell.velocity = 80;
    cell.velocityRange = 80;
    cell.alphaSpeed = -0.5;
    cell.alphaRange = 0.1;
    cell.acceleration = Offset(0.0, -20.0);
    cell.scale = 0.2;
    cell.scaleSpeed = 0.6;
    cell.scaleRange = 2.0;
    cell.emissionLongitude = pi * 1.5;
    cell.emissionRange = pi * 0.35;
    cell.spin = pi * 3;
    cell.spinRange = pi;
    emitter.cells.add(cell);

    {
      cell = Cell.circle(
        radius: 10,
        paint: Paint()
          ..shader = RadialGradient(
            colors: [
              Colors.red,
              Colors.red.withOpacity(0.0),
            ],
          ).createShader(Rect.fromCircle(center: Offset(10, 10), radius: 10)),
      );
      cell.birthRate = 10;
      cell.lifttime = 10;
      cell.lifttimeRange = 0.5;
      cell.velocity = 120;
      cell.velocityRange = 80;
      cell.alphaSpeed = -0.5;
      cell.alphaRange = 0.1;
      cell.acceleration = Offset(0.0, -20.0);
      cell.scale = 0.2;
      cell.scaleSpeed = 0.6;
      cell.scaleRange = 2.0;
      cell.emissionLongitude = pi * 1.5;
      cell.emissionRange = pi * 0.35;
      cell.spin = pi * 3;
      cell.spinRange = pi;
      emitter.cells.add(cell);
    }

    {
      cell = Cell.circle(
        radius: 10,
        paint: Paint()
          ..shader = RadialGradient(
            colors: [
              Colors.blue,
              Colors.blue.withOpacity(0.0),
            ],
          ).createShader(Rect.fromCircle(center: Offset(10, 10), radius: 10)),
      );
      cell.birthRate = 10;
      cell.lifttime = 10;
      cell.lifttimeRange = 0.5;
      cell.velocity = 160;
      cell.velocityRange = 80;
      cell.alphaSpeed = -0.5;
      cell.alphaRange = 0.1;
      cell.acceleration = Offset(0.0, -20.0);
      cell.scale = 0.2;
      cell.scaleSpeed = 0.6;
      cell.scaleRange = 2.0;
      cell.emissionLongitude = pi * 1.5;
      cell.emissionRange = pi * 0.35;
      cell.spin = pi * 3;
      cell.spinRange = pi;
      emitter.cells.add(cell);
    }

    // cell = Cell('doge');
    // cell.birthRate = 1;
    // cell.lifttime = 10;
    // cell.lifttimeRange = 0.5;
    // cell.velocity = 80;
    // cell.velocityRange = 80;
    // cell.alphaSpeed = -0.5;
    // cell.alphaRange = 0.5;
    // cell.acceleration = Offset(0.0, -20.0);
    // cell.scale = 0.2;
    // cell.scaleSpeed = 0.6;
    // cell.scaleRange = 2.0;
    // cell.emissionLongitude = pi * 1.5;
    // cell.emissionRange = pi * 0.35;
    // cell.spin = pi * 3;
    // cell.spinRange = pi;
    // emitter.cells.add(cell);
    // loadIconRound();

    controller.emitters.add(emitter);
    controller.start();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: LiziPlayer(controller: controller),
    );
  }
}
