import { Box3, ReadonlyBox3 } from "./box3";
import { Plane } from "./plane";
import { ReadonlyVector3, Vector3 } from "./vector3";

export interface Polygon3SplitResult {
    back?: Polygon3;
    front?: Polygon3;
}

class PolygonVertex {

    readonly tangent: Vector3 = new Vector3(0, 0, 0);

    private outsideOffset: number = 0;
    private readonly _outside: Vector3 = new Vector3(0, 0, 0);

    set outside(v: Vector3) {
        this._outside.setVector(v);
        this.outsideOffset = this.point.getDotProduct(v);
    }

    constructor(public readonly point: Vector3) { }

    isOutside(point: ReadonlyVector3): boolean {
        return point.getDotProduct(this._outside) > this.outsideOffset;
    }
}

export class Polygon3 {

    readonly normal: ReadonlyVector3;
    readonly center: ReadonlyVector3;
    readonly tangent: ReadonlyVector3;
    readonly plane: Plane;
    readonly boundingBox: ReadonlyBox3;

    private readonly _vertices: ReadonlyArray<PolygonVertex>;

    get size(): number { return this._vertices.length; }

    constructor(data: {
        points: ReadonlyVector3[];
        normal?: ReadonlyVector3;
        tangent?: ReadonlyVector3;
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
            this.tangent = this._vertices[0].tangent;
        }
        const bb = Box3.empty();
        this._vertices.forEach(v => bb.extendByPoint(v.point));
        this.boundingBox = bb;

    }

    static regular(data: {
        count: number;
        radius?: number;
        center?: Vector3;
        normal: Vector3;
        tangent: Vector3;
    }): Polygon3 {
        let radius = data.radius !== undefined ? data.radius : 1;
        let center = data.center !== undefined ? data.center : new Vector3(0, 0, 0);
        let a: number;
        let v: Vector3[] = [];
        let tx = data.tangent.getNormalized();
        let ty = data.normal.getNormalizedCrossProduct(tx);
        let af = Math.PI * 2 / data.count;
        for (let i = 0; i < data.count; ++i) {
            a = (i - .5) * af;
            v.push(center.getSumScaled(tx, radius * Math.sin(a)).getSumScaled(ty, -radius * Math.cos(a)));
        }
        return new Polygon3({ points: v, normal: tx.getCrossProduct(ty), tangent: tx });
    }

    forEachEdge(callback: (p1: ReadonlyVector3, p2: ReadonlyVector3) => any) {
        const l = this._vertices.length;
        this._vertices.forEach((v, i) => {
            callback(v.point, this._vertices[(i + 1) % l].point);
        });
    }

    forEachPoint(callback: (point: ReadonlyVector3, i: number) => any) {
        this._vertices.forEach((v, i) => callback(v.point, i));
    }

    getPoint(i: number): ReadonlyVector3 { return this._vertices[i].point; }

    getTangent(i: number): ReadonlyVector3 { return this._vertices[i].tangent; }

    isInside(point: ReadonlyVector3): boolean {
        const l = this._vertices.length;
        for (let i = 0; i < l; ++i) {
            if (this._vertices[i].isOutside(point))
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

    mapEachPoint<R>(callback: (point: ReadonlyVector3, i: number) => R): R[] {
        return this._vertices.map((v, i) => callback(v.point, i));
    }

    /**
     * Returns the back-sided polygon with flipped normal and reverse order of points.
     */
    reverse(): Polygon3 {
        return new Polygon3({
            points: this._vertices.map(v => v.point).reverse(),
            normal: this.normal.getScaled(-1),
            tangent: this.tangent.getScaled(-1)
        });
    }

    splitBy(plane: Plane): Polygon3SplitResult {
        const pointsBack: Vector3[] = [];
        const pointsFront: Vector3[] = [];
        let p1 = this._vertices[0].point;
        let d1 = plane.getSignedDistance(p1);
        let p2: Vector3, split: Vector3;
        let d2: number, d: number;
        const l = this._vertices.length;
        // TODO forEach
        for (let i = 0; i < l; ++i) {
            p2 = this._vertices[(i + 1) % l].point;
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
        const ret: Polygon3SplitResult = {};
        if (pointsBack.length > 2)
            ret.back = new Polygon3({ points: pointsBack, tangent: this.tangent, normal: this.normal });
        if (pointsFront.length > 2)
            ret.front = new Polygon3({ points: pointsFront, tangent: this.tangent, normal: this.normal });
        return ret;
    }

    toString(): string {
        return `[${this._vertices.map(p => p.point.toString()).join(', ')}]`;
    }

    private calcCenter(): Vector3 {
        // TODO this is not the center
        return this._vertices.reduce((prev, cur) => prev.add(cur.point), new Vector3(0, 0, 0)).getScaled(1 / this._vertices.length);
    }

    private calcNormal(normal?: ReadonlyVector3): Vector3 {
        if (normal !== undefined) {
            return normal.getNormalized();
        } else {
            let p1 = this._vertices[1].point.getDifference(this._vertices[0].point);
            let p2 = this._vertices[2].point.getDifference(this._vertices[1].point);
            const l = this._vertices.length;
            const ret = new Vector3(0, 0, 0);
            // TODO forEach
            for (let i = 0; i < l; ++i) {
                ret.add(p1.getCrossProduct(p2));
                p1 = p2;
                p2 = this._vertices[(i + 3) % l].point.getDifference(this._vertices[(i + 2) % l].point);
            }
            ret.normalize();
            return ret;
        }
    }

    private calcTangents() {
        const l = this._vertices.length;
        // TODO forEach
        for (let i = 0; i < l; ++i) {
            this._vertices[i].tangent.setVector(this._vertices[(i + 1) % l].point.getDirectionFrom(this._vertices[i].point));
            this._vertices[i].outside = this._vertices[i].tangent.getCrossProduct(this.normal);
        }
    }

    private realignPoints() {
        this._vertices.forEach(p => p.point.addScaled(this.normal, -this.plane.getSignedDistance(p.point)));
    }
}