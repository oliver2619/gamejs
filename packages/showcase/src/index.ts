import { ComponentViewport } from '2d/src/component/viewport';
import {
    Camera2,
    Component2d,
    LayeredScene,
    Object2,
    ObjectLayer,
    PathSolid2,
    Material,
    ColorStyle,
    PathBuilder,
    PhysicsSystem,
    StaticLine,
    DynamicCircle,
    PhysicsMaterial,
    StaticLineSegment
} from '2d/src/index';
import { Color } from 'core/src/color';
import { InfiniteAnimation, Vector2 } from 'core/src/index';

setTimeout(() => {

    // base
    const element = document.getElementById('canvas') as HTMLCanvasElement;
    const component = Component2d.attach(element, { alpha: true });
    const camera = new Camera2({});
    camera.position.y = 100;
    const scene = new LayeredScene();
    const viewport = new ComponentViewport({ camera, scene })
    component.addViewport(viewport);
    const layer = new ObjectLayer();
    scene.addLayer(layer);

    // materials
    const color1 = new ColorStyle({ color: Color.white().getScaled(0.8) });
    const color2 = new ColorStyle({ color: Color.white().getScaled(0.9) });
    const mat = new Material({ stroke: color1, fill: color2 });
    const physMat = new PhysicsMaterial({bounciness: 0.5});

    // objects
    const line = new Object2({});
    const angle1 = Math.PI * 0.1;
    const path1 = new PathBuilder()
        .moveTo(-1000 * Math.cos(angle1), -1000 * Math.sin(angle1))
        .lineTo(1000 * Math.cos(angle1), 1000 * Math.sin(angle1))
        .moveTo(-100, 100)
        .lineTo(0, -100)
        .build();
    line.addSolid(new PathSolid2({ path: path1, material: mat }))
    layer.addObject(line);
    const ball  = new Object2({});
    const path2 = new PathBuilder().circle(0, 0, 20).moveTo(0, -25).lineTo(0, 25).moveTo(-25, 0).lineTo(25, 0).build();
    ball.addSolid(new PathSolid2({path: path2, material: mat}));
    ball.position.y = 300;
    layer.addObject(ball);

    const ps = new PhysicsSystem({ globalAcceleration: new Vector2(0, -100) });
    component.addAnimation(new InfiniteAnimation(ev => ps.simulate(ev.timeout)));
    ps.addStaticLine(new StaticLine({point: new Vector2(0, 0), normal: new Vector2(-Math.sin(angle1), Math.cos(angle1)), material: physMat}));
    ps.addStaticBody(new StaticLineSegment({p1: new Vector2(-100, 100), p2: new Vector2(0, -100), material: physMat}));
    ps.addDynamicBody(new DynamicCircle({object: ball, radius: 20, rotationSpeed: -2}));

    // start
    layer.rebuild();
    component.startRenderLoop();
}, 1);