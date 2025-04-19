import { CircleRelativeMomentsOfInertia, DynamicCircle, Material2dCache, Object2d, ObjectLayer, PathBuilder, PathSolid2d, PhysicsMaterial, PhysicsSystem2d, StaticBorder2d, StaticLine2d, StaticPoint2d, StaticPolygon2d } from "@pluto/2d";
import { AnimationBuilder, Vector2d } from "@pluto/core";
import { Showcase2d } from "../showcase-2d";

export class Physics2dShowcase extends Showcase2d {

    protected onInit(): void {

        // base
        this.camera.updateCoordSystem(cs => cs.position.y = 100);
        const layer = new ObjectLayer();
        this.scene.addLayer(layer);

        const physMat = new PhysicsMaterial({ bounciness: 0.9, friction: 1.2 });

        // objects

        const polygon: Array<[number, number]> = [[200, 110], [140, 100], [170, 80]];
        const ball = new Object2d({});
        const ball2 = new Object2d({});
        const path = new PathBuilder().circle(0, 0, 20).moveTo(0, -25).lineTo(0, 25).moveTo(-25, 0).lineTo(25, 0).build();
        Material2dCache.GLOBAL.getMaterial('pattern').then(material => {
            ball.addPart(new PathSolid2d({ path, material, stroke: true, fill: 'nonzero' }));
            ball2.addPart(new PathSolid2d({ path, material, stroke: true, fill: 'nonzero' }));
        });
        ball.updateCoordSystem(cs => cs.position.y = 200);
        ball2.updateCoordSystem(cs => {
            cs.position.y = 420;
            cs.position.x = 160;
        });
        layer.addPart(ball);
        layer.addPart(ball2);

        const ps = new PhysicsSystem2d({ globalAcceleration: new Vector2d(0, -490) });
        this.addAnimation(ps, AnimationBuilder.infinite().onAnimate(ev => ps.simulate(ev.timeout)));
        const angle1 = Math.PI * 0.1;
        ps.addBorder(new StaticBorder2d({ point: new Vector2d(0, 0), normal: new Vector2d(-Math.sin(angle1), Math.cos(angle1)), material: physMat }));
        ps.addStaticBody(new StaticLine2d({ p1: new Vector2d(-100, 120), p2: new Vector2d(0, -100), material: physMat }));
        ps.addStaticBody(new StaticLine2d({ p1: new Vector2d(-100, 120), p2: new Vector2d(-700, 400), material: physMat }));
        ps.addStaticBody(new StaticLine2d({ p1: new Vector2d(300, 0), p2: new Vector2d(310, 500), material: physMat }));
        ps.addStaticBody(new StaticPoint2d({ position: new Vector2d(10, 40), material: physMat }));
        ps.addStaticBody(new StaticPoint2d({ position: new Vector2d(-100, 120), material: physMat }));
        ps.addStaticBody(new StaticPolygon2d({ points: polygon.map(it => new Vector2d(it[0], it[1])), material: physMat }))
        ps.addDynamicBody(new DynamicCircle({ object: ball, radius: 20, relativeMomentOfInertia: CircleRelativeMomentsOfInertia.HOLLOW_SPHERE, rotationSpeed: 50, material: physMat }));
        ps.addDynamicBody(new DynamicCircle({ object: ball2, radius: 20, relativeMomentOfInertia: CircleRelativeMomentsOfInertia.SOLID_SPHERE, rotationSpeed: -50, material: physMat }));
        ps.rebuild();
        layer.physicsSystem = ps;
    }
}