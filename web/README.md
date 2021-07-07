# Lizi

A cross platform particles library. It's simple, fast, light-weight.

Lizi refers `Apple's CoreAnimation Framework`, the particles parameters same as `CoreAnimation`.

## Getting Started
 
### Use codepen (React example)

The simplest way to try Lizi is use StackBlitz.

Click this link to start.

https://stackblitz.com/edit/react-ts-qcampg?file=index.tsx

### Integrate into your project

Use npm or yarn install lizi library.

```sh
npm install lizi-web --save
```

Add `canvas` element to html.

```html
<canvas id="demoCanvas" width="500" height="500" style="background-color: black;"></canvas>
```

Configure `Emitter` and `Cell`.

```js
let player = new Lizi.Player(document.getElementById('demoCanvas'));

var emitter = new Lizi.Emitter();
emitter.emitterPosition = { x: 250, y: 100 };
emitter.emitterSize = { width: 150, height: 150 };
emitter.emitterShape = Lizi.EmitterShape.point;
emitter.emitterMode = Lizi.EmitterMode.outline;
emitter.birthRate = 10;

var cell = new Lizi.Cell('default');
cell.contents = document.createElement('img');
img.src = './icon_round.png'; // Any image for particle content.
cell.birthRate = 10;
cell.lifttime = 2;
cell.lifttimeRange = 0.5;
cell.velocity = 200;
cell.velocityRange = 80;
cell.alphaSpeed = -0.2;
cell.alphaRange = 0.5;
cell.acceleration = { x: 0.0, y: 980.0 };
cell.scale = 1.0;
cell.scaleSpeed = 0.6;
cell.scaleRange = 2.0;
cell.emissionLongitude = Math.PI * 1.5;
cell.emissionRange = Math.PI * 0.6;
cell.spin = Math.PI * 2;
cell.spinRange = Math.PI * 1;

emitter.cells.push(cell);
player.addEmitter(emitter);
player.start()
```

## EmitterShape supports.

- point
- line
- rectangle
- circle
- cuboid
- sphere

## EmitterMode supports.

- points
- outline
- surface
- volume

## License

GPLv3, All code protected by GPLv3 license, do not copy or do copy liked actions to closed-source project.

Do not use in closed-source project.

You can contact author to buy a commercial license.

## More information

More information? Contact WeChat: `ponycui`