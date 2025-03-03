import { Box2d, ReadonlyBox2d } from "./box-2d";
import { ReadonlyVector2d, Vector2d } from "./vector-2d";

export interface ReadonlyCoordSystem2d {
    readonly position: Vector2d;
    readonly xAxis: Vector2d;
    readonly yAxis: Vector2d;
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
    readonly position?: ReadonlyVector2d;
    readonly axis?: { x: ReadonlyVector2d; y: ReadonlyVector2d };
}

export class CoordSystem2d implements ReadonlyCoordSystem2d {

    position: Vector2d;
    xAxis: Vector2d;
    yAxis: Vector2d;

    get rotation(): number {
        return Math.atan2(this.xAxis.y, this.xAxis.x);
    }

    set rotation(r: number) {
        const cs = Math.cos(r);
        const sn = Math.sin(r);
        this.xAxis.set(cs, sn);
        this.yAxis.set(-sn, cs);
    }

    constructor(data?: CoordSystem2dData) {
        this.position = data?.position?.clone() ?? new Vector2d(0, 0);
        if (data == undefined || data.axis == undefined) {
            this.xAxis = new Vector2d(1, 0);
            this.yAxis = new Vector2d(0, 1);
        } else {
            this.xAxis = data.axis.x.clone();
            this.yAxis = data.axis.y.clone();
        }
    }

    clone(): CoordSystem2d {
        return new CoordSystem2d({
            position: this.position,
            axis: { x: this.xAxis, y: this.yAxis }
        });
    }

    getRotated(angle: number): CoordSystem2d {
        return new CoordSystem2d({
            position: this.position,
            axis: { x: this.xAxis.getRotated(angle), y: this.yAxis.getRotated(angle) }
        });
    }

    getScaled(f: number): CoordSystem2d {
        return new CoordSystem2d({
            position: this.position,
            axis: { x: this.xAxis.getScaled(f), y: this.yAxis.getScaled(f) }
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

    resetRotation(): void {
        this.xAxis.set(1, 0);
        this.yAxis.set(0, 1);
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
        this.xAxis.normalize();
        this.yAxis.setVector(this.xAxis.getCrossProductWithScalar(-1));
    }

    setY(y: ReadonlyVector2d): void {
        this.yAxis.setVector(y);
        this.yAxis.normalize();
        this.xAxis.setVector(this.yAxis.getCrossProductWithScalar(1));
    }

    setCoordSystem(coordSystem: ReadonlyCoordSystem2d): void {
        this.position.setVector(coordSystem.position);
        this.xAxis.setVector(coordSystem.xAxis);
        this.yAxis.setVector(coordSystem.yAxis);
    }
}