import { CircleRelativeMomentsOfInertia, DynamicCircle, Material2dCache, Object2d, ObjectLayer, PathBuilder, PathSolid2d, PhysicsMaterial, PhysicsSystem, StaticLine, StaticLineSegment, StaticPoint, StaticPolygon } from "@pluto/2d";
import { Showcase2d } from "../showcase";
import { AnimationBuilder, Vector2d } from "@pluto/core";

export class Physics2dShowcase extends Showcase2d {

    protected onInit(): void {

        // base
        this.camera.updateCoordSystem(cs => cs.position.y = 100);
        const layer = new ObjectLayer();
        this.scene.addLayer(layer);

        // materials
        // materialCache.definePaintStyle('c1', () => new ColorStyle({ color: Color.white().getScaled(0.8) }));
        // materialCache.definePaintStyle('c2', () => new ColorStyle({ color: Color.white().getScaled(0.9) }));
        // materialCache.definePatternStyle('c2', 'tex', image => new PatternStyle(new ImagePattern({ image: image, repetition: 'repeat', transform: new CoordSystem2({}).getScaled(.1) })));
        // materialCache.defineMaterial('mat', {
        //     fill: 'c2',
        //     stroke: 'c1'
        // });
        const physMat = new PhysicsMaterial({ bounciness: 0.9, friction: 1.2 });
        // const objectCache = new ObjectCache({ materialCache, baseUrl: 'assets', imageMapper: id => materialCache.imageCache.get(id), patternMapper: id => materialCache.imageCache.get(id) });
        // objectCache.define('image', { url: 'image.svg' });

        // objects

        const polygon: Array<[number, number]> = [[200, 110], [140, 100], [170, 80]];
        const line = new Object2d({});
        const angle1 = Math.PI * 0.1;
        const path1 = new PathBuilder()
            .bone(-100, 200, 50, true, 100, 350, 30, true)
            .build();
        Material2dCache.getMaterial('pattern').then(mat => line.add(new PathSolid2d({ path: path1, material: mat, stroke: true, fill: 'nonzero' })));
        layer.add(line);
        const ball = new Object2d({});
        const ball2 = new Object2d({});
        const path2 = new PathBuilder().circle(0, 0, 20).moveTo(0, -25).lineTo(0, 25).moveTo(-25, 0).lineTo(25, 0).build();
        Material2dCache.getMaterial('pattern').then(mat => {
            ball.add(new PathSolid2d({ path: path2, material: mat, stroke: true, fill: 'nonzero' }));
            ball2.add(new PathSolid2d({ path: path2, material: mat, stroke: true, fill: 'nonzero' }));
        });
        ball.updateCoordSystem(cs => cs.position.y = 200);
        ball2.updateCoordSystem(cs => {
            cs.position.y = 420;
            cs.position.x = 160;
        });
        layer.add(ball);
        layer.add(ball2);
        // objectCache.get('image').then(it => layer.add(it.root));

        const ps = new PhysicsSystem({ globalAcceleration: new Vector2d(0, -490) });
        this.addAnimation(ps, AnimationBuilder.infinite().onAnimate(ev => ps.simulate(ev.timeout)));
        ps.addStaticLine(new StaticLine({ point: new Vector2d(0, 0), normal: new Vector2d(-Math.sin(angle1), Math.cos(angle1)), material: physMat }));
        ps.addStaticBody(new StaticLineSegment({ p1: new Vector2d(-100, 120), p2: new Vector2d(0, -100), material: physMat }));
        ps.addStaticBody(new StaticLineSegment({ p1: new Vector2d(-100, 120), p2: new Vector2d(-90, 300), material: physMat }));
        ps.addStaticBody(new StaticLineSegment({ p1: new Vector2d(300, 0), p2: new Vector2d(310, 500), material: physMat }));
        ps.addStaticPoint(new StaticPoint({ position: new Vector2d(10, 40), material: physMat }));
        ps.addStaticPoint(new StaticPoint({ position: new Vector2d(-100, 120), material: physMat }));
        ps.addStaticBody(new StaticPolygon({ points: polygon.map(it => new Vector2d(it[0], it[1])), material: physMat }))
        ps.addDynamicBody(new DynamicCircle({ object: ball, radius: 20, relativeMomentOfInertia: CircleRelativeMomentsOfInertia.HOLLOW_SPHERE, rotationSpeed: 50, material: physMat }));
        ps.addDynamicBody(new DynamicCircle({ object: ball2, radius: 20, relativeMomentOfInertia: CircleRelativeMomentsOfInertia.SOLID_SPHERE, rotationSpeed: -50, material: physMat }));
        ps.rebuild();
        layer.physicsSystem = ps;
    }
}