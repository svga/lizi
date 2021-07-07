// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.

import 'package:flutter/material.dart';
import 'package:lizi/renderer.dart';
import 'emitter.dart';

class LiziPlayerController extends ChangeNotifier {
  final List<Emitter> emitters = [];
  bool _running = false;

  bool get running => _running;

  start() {
    _running = true;
    notifyListeners();
  }

  stop() {
    _running = false;
    notifyListeners();
  }
}

class LiziPlayer extends StatelessWidget {
  final LiziPlayerController controller;

  LiziPlayer({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Renderer(liziPlayerController: controller);
  }
}
