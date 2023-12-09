import { Component } from '@angular/core';
import { Color, InfiniteAnimation, Vector2 } from 'projects/core/src/public-api';
import { Camera2, CircleRelativeMomentsOfInertia, ColorStyle, Component2dAdapterData, ComponentViewport, LayeredScene, Material, Object2, ObjectLayer, PathBuilder, PathSolid2, PhysicsMaterial, PhysicsSystem, SimulatedCircle, StaticLine, StaticLineSegment, StaticPoint } from 'projects/game2d/src/public-api';
import { Component2dAdapter } from 'projects/game2d/src/public-api';

@Component({
  selector: 'sc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  readonly configuration: Component2dAdapterData = {
    alpha: true
  };

  onInit(component: Component2dAdapter) {


    // base
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
    const physMat = new PhysicsMaterial({ bounciness: 0.9, friction: 1.2 });

    // objects
    const line = new Object2({});
    const angle1 = Math.PI * 0.1;
    const path1 = new PathBuilder()
        .moveTo(-1000 * Math.cos(angle1), -1000 * Math.sin(angle1))
        .lineTo(1000 * Math.cos(angle1), 1000 * Math.sin(angle1))
        .moveTo(-100, 120)
        .lineTo(0, -100)
        .moveTo(8, 38)
        .lineTo(12, 42)
        .moveTo(12, 38)
        .lineTo(8, 42)
        .build();
    line.addSolid(new PathSolid2({ path: path1, material: mat }))
    layer.addObject(line);
    const ball = new Object2({});
    const path2 = new PathBuilder().circle(0, 0, 20).moveTo(0, -25).lineTo(0, 25).moveTo(-25, 0).lineTo(25, 0).build();
    ball.addSolid(new PathSolid2({ path: path2, material: mat }));
    ball.position.y = 200;
    layer.addObject(ball);

    const ps = new PhysicsSystem({ globalAcceleration: new Vector2(0, -490) });
    component.addAnimation(new InfiniteAnimation(ev => ps.simulate(ev.timeout)));
    ps.addStaticLine(new StaticLine({ point: new Vector2(0, 0), normal: new Vector2(-Math.sin(angle1), Math.cos(angle1)), material: physMat }));
    ps.addStaticBody(new StaticLineSegment({ p1: new Vector2(-100, 120), p2: new Vector2(0, -100), material: physMat }));
    ps.addStaticPoint(new StaticPoint({position: new Vector2(10, 40), material: physMat}));
    ps.addDynamicBody(new SimulatedCircle({ object: ball, radius: 20, relativeMomentOfInertia: CircleRelativeMomentsOfInertia.HOLLOW_SPHERE, rotationSpeed: 30 , material: physMat}));

    // start
    layer.rebuild();
    component.startRenderLoop();
  }


}
