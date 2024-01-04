import { Component } from '@angular/core';
import { Camera2, CircleRelativeMomentsOfInertia, ColorStyle, Component2dAdapterData, ComponentViewport, LayeredScene, ObjectLayer, PathBuilder, PathSolid2, PhysicsMaterial, PhysicsSystem, SimulatedCircle, StaticLine, StaticLineSegment, StaticPoint, Object2, MaterialCache, PatternStyle, ImagePattern } from 'game2d';
import { Color, CoordSystem2, ImageCache, InfiniteAnimation, Vector2 } from 'core';

@Component({
  selector: 'sc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  readonly configuration: Component2dAdapterData = {
    alpha: true
  };

  onInit(component: any) { // ComponentAdapter


    // base
    const camera = new Camera2({});
    camera.position.y = 100;
    const scene = new LayeredScene();
    const viewport = new ComponentViewport({ camera, scene })
    component.addViewport(viewport);
    const layer = new ObjectLayer();
    scene.addLayer(layer);

    // materials
    const imageCache = new ImageCache({baseUrl: 'assets'});
    imageCache.define('tex', {url: 'texture.png', alpha: 'keepAlpha'})
    const materialCache = new MaterialCache(imageCache);
    materialCache.definePaintStyle('c1', () => new ColorStyle({ color: Color.white().getScaled(0.8) }));
    // materialCache.definePaintStyle('c2', () => new ColorStyle({ color: Color.white().getScaled(0.9) }));
    materialCache.definePatternStyle('c2', 'tex', image => new PatternStyle(new ImagePattern({image: image, repetition: 'repeat', transform: new CoordSystem2({}).getScaled(.1)})));
    materialCache.defineMaterial('mat', {
      fill: 'c2',
      stroke: 'c1'
    });
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
    materialCache.getMaterial('mat').then(mat => line.addSolid(new PathSolid2({ path: path1, material: mat })));
    layer.addObject(line);
    const ball = new Object2({});
    const path2 = new PathBuilder().circle(0, 0, 20).moveTo(0, -25).lineTo(0, 25).moveTo(-25, 0).lineTo(25, 0).build();
    materialCache.getMaterial('mat').then(mat => ball.addSolid(new PathSolid2({ path: path2, material: mat })));
    ball.position.y = 200;
    layer.addObject(ball);

    const ps = new PhysicsSystem({ globalAcceleration: new Vector2(0, -490) });
    component.addAnimation(new InfiniteAnimation(ev => ps.simulate(ev.timeout)));
    ps.addStaticLine(new StaticLine({ point: new Vector2(0, 0), normal: new Vector2(-Math.sin(angle1), Math.cos(angle1)), material: physMat }));
    ps.addStaticBody(new StaticLineSegment({ p1: new Vector2(-100, 120), p2: new Vector2(0, -100), material: physMat }));
    ps.addStaticPoint(new StaticPoint({ position: new Vector2(10, 40), material: physMat }));
    ps.addDynamicBody(new SimulatedCircle({ object: ball, radius: 20, relativeMomentOfInertia: CircleRelativeMomentsOfInertia.HOLLOW_SPHERE, rotationSpeed: 30, material: physMat }));

    // start
    materialCache.wait().then(() => {
      layer.rebuild();
      component.startRenderLoop();
    });
  }


}
