import { ComponentViewport } from '2d/src/component/viewport';
import { Camera2, Component2d, LayeredScene, Object2, ObjectLayer, PathSolid2, Material, ColorStyle, PathBuilder, PhysicsSystem, StaticLine, DynamicCircle, PhysicsMaterial } from '2d/src/index';
import { Color } from 'core/src/color';
import { InfiniteAnimation, Rectangle, Vector2 } from 'core/src/index';

setTimeout(() => {

    // base
    const element = document.getElementById('canvas') as HTMLCanvasElement;
    const component = Component2d.attach(element, { alpha: false });
    const camera = new Camera2({});
    camera.position.y = 100;
    const scene = new LayeredScene();
    const viewport = new ComponentViewport({ camera, scene, viewportFunction: sz => new Rectangle(0, 0, sz.x, sz.y) })
    component.addViewport(viewport);
    const layer = new ObjectLayer();
    scene.addLayer(layer);

    // materials
    const color1 = new ColorStyle({ color: new Color(1, 1, 1, 1) });
    const color2 = new ColorStyle({ color: new Color(0.5, 0.5, 0.5, 1) });
    const mat = new Material({ stroke: color1, fill: color2 });
    const physMat = new PhysicsMaterial({bounciness: 0.5});

    // objects
    const line = new Object2({});
    const path1 = new PathBuilder().moveTo(-1000, 0).lineTo(1000, 0).build();
    line.addSolid(new PathSolid2({ path: path1, material: mat }))
    layer.addObject(line);
    const ball  = new Object2({});
    const path2 = new PathBuilder().circle(0, 0, 20).build();
    ball.addSolid(new PathSolid2({path: path2, material: mat}));
    ball.position.y = 300;
    layer.addObject(ball);

    const ps = new PhysicsSystem({ globalAcceleration: new Vector2(0, -35) });
    component.addAnimation(new InfiniteAnimation(ev => ps.simulate(ev.timeout)));
    ps.addStaticLine(new StaticLine({point: new Vector2(0, 0), normal: new Vector2(0, 1), material: physMat}));
    ps.addDynamicBody(new DynamicCircle({object: ball, radius: 20}));

    // start
    layer.rebuild();
    component.startRenderLoop();
}, 1);