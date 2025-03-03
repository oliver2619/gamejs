import { Box3d, ReadonlyBox3d } from "./box-3d";
import { Plane } from "./plane";
import { ReadonlyVector3d, Vector3d } from "./vector-3d";

export interface Polygon3dSplitResult {
    back?: Polygon3d;
    front?: Polygon3d;
}

class PolygonVertex {

    readonly tangent: Vector3d = new Vector3d(0, 0, 0);

    private outsideOffset: number = 0;
    private readonly _outside: Vector3d = new Vector3d(0, 0, 0);

    set outside(v: Vector3d) {
        this._outside.setVector(v);
        this.outsideOffset = this.point.getDotProduct(v);
    }

    constructor(public readonly point: Vector3d) { }

    isOutside(point: ReadonlyVector3d): boolean {
        return point.getDotProduct(this._outside) > this.outsideOffset;
    }
}

export class Polygon3d {

    readonly normal: ReadonlyVector3d;
    readonly center: ReadonlyVector3d;
    readonly tangent: ReadonlyVector3d;
    readonly plane: Plane;
    readonly boundingBox: ReadonlyBox3d;

    private readonly _vertices: ReadonlyArray<PolygonVertex>;

    get size(): number { return this._vertices.length; }

    constructor(data: {
        points: ReadonlyVector3d[];
        normal?: ReadonlyVector3d;
        tangent?: ReadonlyVector3d;
        normalize?: boolean;
    }) {
        if (data.points.length < 3)
            throw new RangeError('Polygon must have at least three points');
        this._vertices = Object.freeze(data.points.map(v => new PolygonVertex(v.clone())));
        this.center = this.calcCenter();
        this.normal = this.calcNormal(data.normal);
        this.plane = Plane.fromNormal(this.center, this.normal);
        if (data.normalize === true) {
            this.realignPoints();
        }
        this.calcTangents();
        if (data.tangent !== undefined) {
            this.tangent = data.tangent.getNormalized();
        } else {
            this.tangent = this._vertices[0]!.tangent;
        }
        const bb = Box3d.empty();
        this._vertices.forEach(v => bb.extendByPoint(v.point));
        this.boundingBox = bb;

    }

    static regular(data: {
        count: number;
        radius?: number;
        center?: Vector3d;
        normal: Vector3d;
        tangent: Vector3d;
    }): Polygon3d {
        let radius = data.radius !== undefined ? data.radius : 1;
        let center = data.center !== undefined ? data.center : new Vector3d(0, 0, 0);
        let a: number;
        let v: Vector3d[] = [];
        let tx = data.tangent.getNormalized();
        let ty = data.normal.getNormalizedCrossProduct(tx);
        let af = Math.PI * 2 / data.count;
        for (let i = 0; i < data.count; ++i) {
            a = (i - .5) * af;
            v.push(center.getSumScaled(tx, radius * Math.sin(a)).getSumScaled(ty, -radius * Math.cos(a)));
        }
        return new Polygon3d({ points: v, normal: tx.getCrossProduct(ty), tangent: tx });
    }

    forEachEdge(callback: (p1: ReadonlyVector3d, p2: ReadonlyVector3d) => any) {
        const l = this._vertices.length;
        this._vertices.forEach((v, i) => {
            callback(v.point, this._vertices[(i + 1) % l]!.point);
        });
    }

    forEachPoint(callback: (point: ReadonlyVector3d, i: number) => any) {
        this._vertices.forEach((v, i) => callback(v.point, i));
    }

    getPoint(i: number): ReadonlyVector3d { return this._vertices[i]!.point; }

    getTangent(i: number): ReadonlyVector3d { return this._vertices[i]!.tangent; }

    isInside(point: ReadonlyVector3d): boolean {
        const l = this._vertices.length;
        for (let i = 0; i < l; ++i) {
            if (this._vertices[i]!.isOutside(point))
                return false;
        }
        return true;
    }

    isSplitBy(plane: Plane): boolean {
        let posCnt = 0, negCnt = 0;
        return this._vertices.findIndex(p => {
            let d = plane.getSignedDistance(p.point);
            if (d < 0) {
                if (posCnt > 0)
                    return true;
                ++negCnt;
            } else if (d > 0) {
                if (negCnt > 0)
                    return true;
                ++posCnt;
            }
            return false;
        }) > -1;
    }

    mapEachPoint<R>(callback: (point: ReadonlyVector3d, i: number) => R): R[] {
        return this._vertices.map((v, i) => callback(v.point, i));
    }

    /**
     * Returns the back-sided polygon with flipped normal and reverse order of points.
     */
    reverse(): Polygon3d {
        return new Polygon3d({
            points: this._vertices.map(v => v.point).reverse(),
            normal: this.normal.getScaled(-1),
            tangent: this.tangent.getScaled(-1)
        });
    }

    splitBy(plane: Plane): Polygon3dSplitResult {
        const pointsBack: Vector3d[] = [];
        const pointsFront: Vector3d[] = [];
        let p1 = this._vertices[0]!.point;
        let d1 = plane.getSignedDistance(p1);
        let p2: Vector3d, split: Vector3d;
        let d2: number, d: number;
        const l = this._vertices.length;
        // TODO forEach
        for (let i = 0; i < l; ++i) {
            p2 = this._vertices[(i + 1) % l]!.point;
            d2 = plane.getSignedDistance(p2);
            if (d1 < 0) {
                pointsBack.push(p1);
                if (d2 > 0) {
                    d = 1 / (d2 - d1);
                    split = p1.getScaled(d * d2);
                    split.addScaled(p2, -d * d1);
                    pointsBack.push(split);
                    pointsFront.push(split);
                }
            } else if (d1 > 0) {
                pointsFront.push(p1);
                if (d2 < 0) {
                    d = 1 / (d1 - d2);
                    split = p1.getScaled(-d * d2);
                    split.addScaled(p2, d * d1);
                    pointsBack.push(split);
                    pointsFront.push(split);
                }
            } else {
                pointsBack.push(p1);
                pointsFront.push(p1);
            }
            p1 = p2;
            d1 = d2;
        }
        const ret: Polygon3dSplitResult = {};
        if (pointsBack.length > 2)
            ret.back = new Polygon3d({ points: pointsBack, tangent: this.tangent, normal: this.normal });
        if (pointsFront.length > 2)
            ret.front = new Polygon3d({ points: pointsFront, tangent: this.tangent, normal: this.normal });
        return ret;
    }

    toString(): string {
        return `[${this._vertices.map(p => p.point.toString()).join(', ')}]`;
    }

    private calcCenter(): Vector3d {
        const box = Box3d.empty();
        this._vertices.forEach(it => box.extendByPoint(it.point));
        return box.center!;
    }

    private calcNormal(normal?: ReadonlyVector3d): Vector3d {
        if (normal !== undefined) {
            return normal.getNormalized();
        } else {
            let p1 = this._vertices[1]!.point.getDifference(this._vertices[0]!.point);
            let p2 = this._vertices[2]!.point.getDifference(this._vertices[1]!.point);
            const l = this._vertices.length;
            const ret = new Vector3d(0, 0, 0);
            // TODO forEach
            for (let i = 0; i < l; ++i) {
                ret.add(p1.getCrossProduct(p2));
                p1 = p2;
                p2 = this._vertices[(i + 3) % l]!.point.getDifference(this._vertices[(i + 2) % l]!.point);
            }
            ret.normalize();
            return ret;
        }
    }

    private calcTangents() {
        const l = this._vertices.length;
        // TODO forEach
        for (let i = 0; i < l; ++i) {
            this._vertices[i]!.tangent.setVector(this._vertices[(i + 1) % l]!.point.getDirectionFrom(this._vertices[i]!.point));
            this._vertices[i]!.outside = this._vertices[i]!.tangent.getCrossProduct(this.normal);
        }
    }

    private realignPoints() {
        this._vertices.forEach(p => p.point.addScaled(this.normal, -this.plane.getSignedDistance(p.point)));
    }
}