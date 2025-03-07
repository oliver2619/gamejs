import { Body } from "./body";
import { CollisionMnemento } from "./collision-mnemento";
import { ForceConstraints } from "./force-constraints";
import { DynamicCircle } from "./dynamic-circle";
import { StaticBodyData } from "./static-body";
import { StaticBoxedBody } from "./static-boxed-body";
import { Box2d, ReadonlyVector2d, Vector2d } from "core";

export interface StaticPolygonData extends StaticBodyData {
    points: ReadonlyVector2d[];
}

class PolygonLineSegment {

    readonly p1: ReadonlyVector2d;
    readonly normal: ReadonlyVector2d;
    readonly tangent: ReadonlyVector2d;
    readonly offset: number;
    readonly length: number;

    constructor(p1: ReadonlyVector2d, p2: ReadonlyVector2d) {
        this.p1 = p1.clone();
        this.tangent = p2.getDifference(p1).getNormalized();
        this.normal = p2.getDifference(p1).getNormalizedCrossProduct(1);
        this.offset = p1.getDotProduct(this.normal);
        this.length = p2.getDistance(p1);
    }

    getCollisionWithCircle(circle: DynamicCircle, mnemento: CollisionMnemento, body: Body) {
        const speedDotProduct = circle.speed.getDotProduct(this.normal);
        if (speedDotProduct === 0) {
            return;
        }
        const signedDistance = circle.object.position.getDotProduct(this.normal) - this.offset;
        let t: number;
        if (speedDotProduct > 0) {
            t = (-circle.radius - signedDistance) / speedDotProduct;
        } else {
            t = (circle.radius - signedDistance) / speedDotProduct;
        }
        const tangentOffset = circle.object.position.getDifference(this.p1).getSumScaled(circle.speed, t).getDotProduct(this.tangent);
        if (tangentOffset >= 0 && tangentOffset <= this.length) {
            mnemento.add(t, () => circle.collideAtSurface(this.normal, circle.object.position.getSumScaled(this.normal, -signedDistance), body));
        }
    }

    getStaticForceConstraintForCircle(circle: DynamicCircle, constraints: ForceConstraints) {
        const signedDistance = circle.object.position.getDotProduct(this.normal) - this.offset;
        const tangentOffset = circle.object.position.getDifference(this.p1).getDotProduct(this.tangent);
        if (Math.abs(signedDistance) <= circle.radius && tangentOffset >= 0 && tangentOffset <= this.length) {
            if (signedDistance > 0) {
                constraints.addPlane(this.normal, circle.radius - signedDistance);
            } else {
                constraints.addPlane(this.normal.getScaled(-1), circle.radius + signedDistance);
            }
        }
    }
}

export class StaticPolygon extends StaticBoxedBody {

    private readonly points: Vector2d[];
    private readonly lineSegments: PolygonLineSegment[];

    constructor(data: Readonly<StaticPolygonData>) {
        super(data);
        if (data.points.length < 3) {
            throw new RangeError('Polygon must contain at least 3 points');
        }
        const box = Box2d.empty();
        data.points.forEach(it => box.extendByPoint(it));
        this.postConstruct(box);
        // const ccw = this.isCcw(data.points, box.center!);
        // TODO filter only convex points
        this.points = data.points.map(it => it.clone());
        this.lineSegments = data.points.map((it, i) => new PolygonLineSegment(it, data.points[(i + 1) % data.points.length]!));
    }

    getCollisionWithCircle(circle: DynamicCircle, mnemento: CollisionMnemento) {
        this.points.forEach(point => {
            const deltaPos = circle.object.position.getDifference(point);
            const a = circle.speed.squareLength;
            if (a === 0) {
                return;
            }
            const b = deltaPos.getDotProduct(circle.speed);
            const c = deltaPos.squareLength - circle.radius * circle.radius;
            const det = b * b - a * c;
            if (det < 0) {
                return;
            }
            const t = a > 0 ? (-b - Math.sqrt(det)) / a : (-b + Math.sqrt(det)) / a;
            mnemento.add(t, () => circle.collideAtSurface(circle.object.position.getDifference(point).getNormalized(), point, this));
        });
        this.lineSegments.forEach(it => it.getCollisionWithCircle(circle, mnemento, this));
    }

    getStaticForceConstraintForCircle(circle: DynamicCircle, constraints: ForceConstraints) {
        this.points.forEach(point => {
            const deltaPos = circle.object.position.getDifference(point);
            const squareDist = deltaPos.squareLength;
            if (squareDist <= circle.radius * circle.radius && squareDist > 0) {
                constraints.addPlane(deltaPos.getScaled(1 / Math.sqrt(squareDist)), circle.radius - Math.sqrt(squareDist));
            }
        });
        this.lineSegments.forEach(it => it.getStaticForceConstraintForCircle(circle, constraints));
    }

    protected onRender(context: CanvasRenderingContext2D) {
        context.beginPath();
        this.points.forEach((p, i) => {
            if (i === 0) {
                context.moveTo(p.x, -p.y);
            } else {
                context.lineTo(p.x, -p.y);
            }
        });
        context.closePath();
    }

    // private isCcw(points: ReadonlyVector2d[], center: ReadonlyVector2d): boolean {
    //     const v = points.map(it => it.getDifference(center));
    //     let n = 0;
    //     for (let i = 0; i < v.length; ++i) {
    //         n += v[i]!.getDotProduct(v[(i + 1) % v.length]!);
    //     }
    //     return n > 0;
    // }
}