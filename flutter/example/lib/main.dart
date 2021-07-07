import 'package:example/sample_code.dart';
import 'package:example/sample_laf.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      routes: {
        '/code': (context) => SampleCodePage(),
        '/laf': (context) => LafPage(),
      },
      home: HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Lizi Samples'),
      ),
      body: ListView(
        children: [
          ListTile(
            onTap: () {
              Navigator.of(context).pushNamed('/code');
            },
            title: Text('Play via code'),
          ),
          ListTile(
            onTap: () {
              Navigator.of(context).pushNamed('/laf');
            },
            title: Text('Play via laf'),
          ),
        ],
      ),
    );
  }
}
