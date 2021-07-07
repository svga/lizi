// Copyright (c) 2021, PonyCui.
// for details. All rights reserved. Use of this source code is governed by a
// GPLv3 license that can be found in the LICENSE file.

import 'dart:convert';

import 'emitter.dart';

/// Laf means 'Lizi Animation File'.
/// Saves emitters and cells info.
class LafItem {
  final List<Emitter> emitters = [];

  static LafItem decodeFromString(String value) {
    final item = LafItem();
    final decodedObject = json.decode(value);
    if (decodedObject['emitters'] is List) {
      item.emitters.addAll((decodedObject['emitters'] as List)
          .map((e) => Emitter.decodeFromMap(e))
          .toList());
    }
    return item;
  }

  Map toJson() {
    return {'emitters': emitters};
  }

  String encode() {
    return json.encode(this);
  }
}
