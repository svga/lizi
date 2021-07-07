// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.

import 'package:flutter/widgets.dart';
import 'package:lizi/laf_item.dart';

class LafImageView extends StatefulWidget {
  final LafItem? item;

  const LafImageView({Key? key, this.item}) : super(key: key);

  @override
  _LafImageViewState createState() => _LafImageViewState();
}

class _LafImageViewState extends State<LafImageView>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  int lastTime = DateTime.now().millisecondsSinceEpoch;

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(vsync: this, value: 0.0);
    _animationController.addListener(() {
      int curTime = DateTime.now().millisecondsSinceEpoch;
      int deltaTime = curTime - lastTime;
      lastTime = curTime;
      widget.item?.emitters.forEach((emitter) {
        // emitter.update(deltaTime);
      });
      setState(() {});
    });
    _animationController.animateTo(
      1.0,
      duration: Duration(seconds: 86400 * 31),
      curve: Curves.linear,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (widget.item == null) return Container();
    return CustomPaint(
      painter: _LafImageViewPainter(widget.item!),
    );
  }
}

class _LafImageViewPainter extends CustomPainter {
  LafItem item;

  _LafImageViewPainter(this.item);

  @override
  void paint(Canvas canvas, Size size) {
    // item.emitters.forEach((emitter) {
    //   emitter.draw(canvas);
    // });
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return true;
  }
}
