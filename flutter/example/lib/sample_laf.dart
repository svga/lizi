import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lizi/laf_item.dart';
import 'package:lizi/lizi.dart';

class LafPage extends StatefulWidget {
  const LafPage({Key? key}) : super(key: key);

  @override
  _LafPageState createState() => _LafPageState();
}

class _LafPageState extends State<LafPage> {
  LafItem? lafItem;

  @override
  void initState() {
    super.initState();
    loadLafItem();
  }

  void loadLafItem() async {
    final data = await rootBundle.loadString('images/sample.json');
    final lafItem = LafItem.decodeFromString(data);
    setState(() {
      this.lafItem = lafItem;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: LafImageView(item: lafItem),
    );
  }
}
