import { Box2d, ReadonlyBox2d } from "./box-2d";
import { ReadonlyVector2d, Vector2d } from "./vector-2d";

export interface ReadonlyCoordSystem2d {
    readonly position: ReadonlyVector2d;
    readonly xAxis: ReadonlyVector2d;
    readonly yAxis: ReadonlyVector2d;
    readonly rotation: number;
    clone(): CoordSystem2d;
    getRotated(angle: number): CoordSystem2d;
    getScaled(f: number): CoordSystem2d;
    globalToLocal(point: ReadonlyVector2d): Vector2d;
    globalDirectionToLocal(point: ReadonlyVector2d): Vector2d;
    localBoxToGlobal(box: ReadonlyBox2d): Box2d;
    localToGlobal(point: ReadonlyVector2d): Vector2d;
    localDirectionToGlobal(point: ReadonlyVector2d): Vector2d;
}

export interface CoordSystem2dData {
    position?: ReadonlyVector2d | undefined;
    xAxis?: ReadonlyVector2d | undefined;
    yAxis?: ReadonlyVector2d | undefined;
}

export class CoordSystem2d implements ReadonlyCoordSystem2d {

    position: Vector2d;
    xAxis: Vector2d;
    yAxis: Vector2d;

    get rotation(): number {
        // TODO this may be unprecise
        return Math.atan2(this.xAxis.y, this.xAxis.x);
    }

    set rotation(r: number) {
        const cs = Math.cos(r);
        const sn = Math.sin(r);
        const lx = this.xAxis.length;
        const ly = this.yAxis.length;
        this.xAxis.set(cs * lx, sn * ly);
        this.yAxis.set(-sn * lx, cs * ly);
    }

    constructor(data?: Readonly<CoordSystem2dData>) {
        this.position = data?.position?.clone() ?? new Vector2d(0, 0);
        if (data?.xAxis != undefined) {
            this.xAxis = data.xAxis.clone();
            this.yAxis = data.yAxis?.clone() ?? this.xAxis.getCrossProductWithScalar(1);
        } else if (data?.yAxis != undefined) {
            this.yAxis = data.yAxis.clone();
            this.xAxis = this.yAxis.getCrossProductWithScalar(-1);
        } else {
            this.xAxis = new Vector2d(1, 0);
            this.yAxis = new Vector2d(0, 1);
        }
    }

    clone(): CoordSystem2d {
        return new CoordSystem2d({
            position: this.position,
            xAxis: this.xAxis,
            yAxis: this.yAxis
        });
    }

    getRotated(angle: number): CoordSystem2d {
        return new CoordSystem2d({
            position: this.position,
            xAxis: this.xAxis.getRotated(angle),
            yAxis: this.yAxis.getRotated(angle)
        });
    }

    getScaled(f: number): CoordSystem2d {
        return new CoordSystem2d({
            position: this.position,
            xAxis: this.xAxis.getScaled(f),
            yAxis: this.yAxis.getScaled(f)
        });
    }

    globalToLocal(point: ReadonlyVector2d): Vector2d {
        let diff = point.getDifference(this.position);
        return new Vector2d(
            diff.getDotProduct(this.xAxis) / this.xAxis.squareLength,
            diff.getDotProduct(this.yAxis) / this.yAxis.squareLength);
    }

    globalDirectionToLocal(point: ReadonlyVector2d): Vector2d {
        return new Vector2d(
            point.getDotProduct(this.xAxis) / this.xAxis.squareLength,
            point.getDotProduct(this.yAxis) / this.yAxis.squareLength);
    }

    localBoxToGlobal(box: ReadonlyBox2d): Box2d {
        if (box.minimum == undefined || box.maximum == undefined) {
            return box.clone();
        }
        const ret = Box2d.empty();
        ret.extendByPoint(this.localToGlobal(box.minimum));
        ret.extendByPoint(this.localToGlobal(box.maximum));
        ret.extendByPoint(this.localToGlobal(new Vector2d(box.minimum.x, box.maximum.y)));
        ret.extendByPoint(this.localToGlobal(new Vector2d(box.maximum.x, box.minimum.y)));
        return ret;
    }

    localToGlobal(point: ReadonlyVector2d): Vector2d {
        let ret = this.position.clone();
        ret.add(this.xAxis.getScaled(point.x));
        ret.add(this.yAxis.getScaled(point.y));
        return ret;
    }

    localDirectionToGlobal(point: ReadonlyVector2d): Vector2d {
        let ret = this.xAxis.getScaled(point.x);
        ret.add(this.yAxis.getScaled(point.y));
        return ret;
    }

    normalize() {
        this.xAxis.normalize();
        this.yAxis.normalize();
    }

    normalizeSetRotation(r: number) {
        const cs = Math.cos(r);
        const sn = Math.sin(r);
        this.xAxis.set(cs, sn);
        this.yAxis.set(-sn, cs);
    }

    orthoNormalizeUsingX() {
        this.xAxis.normalize();
        this.yAxis.set(-this.xAxis.y, this.xAxis.x);
    }

    orthoNormalizeUsingY() {
        this.yAxis.normalize();
        this.xAxis.set(this.yAxis.y, -this.yAxis.x);
    }

    resetRotation(): void {
        this.xAxis.set(this.xAxis.length, 0);
        this.yAxis.set(0, this.yAxis.length);
    }

    rotate(angle: number): void {
        this.xAxis.rotate(angle);
        this.yAxis.rotate(angle);
    }

    scale(factor: number) {
        this.xAxis.scale(factor);
        this.yAxis.scale(factor);
    }

    setX(x: ReadonlyVector2d): void {
        this.xAxis.setVector(x);
        this.yAxis.set(-this.xAxis.y, this.xAxis.x);
    }

    setY(y: ReadonlyVector2d): void {
        this.yAxis.setVector(y);
        this.xAxis.set(this.yAxis.y, -this.yAxis.x);
    }

    setCoordSystem(coordSystem: ReadonlyCoordSystem2d): void {
        this.position.setVector(coordSystem.position);
        this.xAxis.setVector(coordSystem.xAxis);
        this.yAxis.setVector(coordSystem.yAxis);
    }
}