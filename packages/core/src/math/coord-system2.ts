import { EventObservable } from "../event/event-observable";
import { Box2, ReadonlyBox2 } from "./box2";
import { ReadonlyVector2, Vector2 } from "./vector2";

export interface CoordSystem2Data {
    readonly position?: ReadonlyVector2;
    readonly axis?: { x: ReadonlyVector2; y: ReadonlyVector2 };
}

export abstract class ReadonlyCoordSystem2 {

    abstract readonly position: Vector2;
    abstract readonly xAxis: Vector2;
    abstract readonly yAxis: Vector2;
    abstract readonly rotation: number;

    protected readonly _position: Vector2;
    protected readonly _xAxis: Vector2;
    protected readonly _yAxis: Vector2;

    constructor(data: CoordSystem2Data) {
        this._position = data.position !== undefined ? data.position.clone() : new Vector2(0, 0);
        if (data.axis !== undefined) {
            this._xAxis = data.axis.x.clone();
            this._yAxis = data.axis.y.clone();
        } else {
            this._xAxis = new Vector2(1, 0);
            this._yAxis = new Vector2(0, 1);
        }
    }

    globalToLocal(point: ReadonlyVector2): Vector2 {
        let diff = point.getDifference(this._position);
        return new Vector2(
            diff.getDotProduct(this._xAxis) / this._xAxis.squareLength,
            diff.getDotProduct(this._yAxis) / this._yAxis.squareLength);
    }

    globalDirectionToLocal(point: ReadonlyVector2): Vector2 {
        return new Vector2(
            point.getDotProduct(this._xAxis) / this._xAxis.squareLength,
            point.getDotProduct(this._yAxis) / this._yAxis.squareLength);
    }

    localBoxToGlobal(box: ReadonlyBox2): Box2 {
        if (box.minimum == undefined || box.maximum == undefined) {
            return box.clone();
        }
        const ret = Box2.empty();
        ret.extendByPoint(this.localToGlobal(box.minimum));
        ret.extendByPoint(this.localToGlobal(box.maximum));
        ret.extendByPoint(this.localToGlobal(new Vector2(box.minimum.x, box.maximum.y)));
        ret.extendByPoint(this.localToGlobal(new Vector2(box.maximum.x, box.minimum.y)));
        return ret;
    }

    localToGlobal(point: ReadonlyVector2): Vector2 {
        let ret = this._position.clone();
        ret.add(this._xAxis.getScaled(point.x));
        ret.add(this._yAxis.getScaled(point.y));
        return ret;
    }

    localDirectionToGlobal(point: ReadonlyVector2): Vector2 {
        let ret = this._xAxis.getScaled(point.x);
        ret.add(this._yAxis.getScaled(point.y));
        return ret;
    }

}

export class CoordSystem2 extends ReadonlyCoordSystem2 {

    readonly onModify = new EventObservable<ReadonlyCoordSystem2>();

    private _enableModifyCallback = true;

    get position(): Vector2 {
        return this._position;
    }

    set position(p: Vector2) {
        this._position.setVector(p);
    }

    get xAxis(): Vector2 {
        return this._xAxis;
    }

    set xAxis(a: Vector2) {
        this._xAxis.setVector(a);
    }

    get yAxis(): Vector2 {
        return this._yAxis;
    }

    set yAxis(a: Vector2) {
        this._yAxis.setVector(a);
    }

    get rotation(): number {
        return Math.atan2(this._xAxis.y, this._xAxis.x);
    }

    set rotation(r: number) {
        this.batchModify(()=> {
            const cs = Math.cos(r);
            const sn = Math.sin(r);
            this._xAxis.set(cs, sn);
            this._yAxis.set(-sn, cs);
        });
    }

    constructor(data: CoordSystem2Data) {
        super(data);
        const modifyCallback = () => { if (this._enableModifyCallback) { this.onModify.produce(this); } };
        this._position.onModify.subscribe(modifyCallback);
        this._xAxis.onModify.subscribe(modifyCallback);
        this._yAxis.onModify.subscribe(modifyCallback);
    }

    clone(): CoordSystem2 {
        return new CoordSystem2({
            position: this._position,
            axis: { x: this._xAxis, y: this._yAxis }
        });
    }

    resetRotation(): void {
        this.batchModify(() => {
            this._xAxis.set(1, 0);
            this._yAxis.set(0, 1);
        });
    }

    rotate(angle: number): void {
        this.batchModify(() => {
            this._xAxis.rotate(angle);
            this._yAxis.rotate(angle);
        });
    }

    scale(factor: number) {
        this.batchModify(() => {
            this._xAxis.scale(factor);
            this._yAxis.scale(factor);
        });
    }

    setX(x: ReadonlyVector2): void {
        this.batchModify(() => {
            this._xAxis.setVector(x).normalize();
            this._yAxis.setVector(this._xAxis.getCrossProduct(-1));
        });
    }

    setY(y: ReadonlyVector2): void {
        this.batchModify(() => {
            this._yAxis.setVector(y).normalize();
            this._xAxis.setVector(this._yAxis.getCrossProduct(1));
        });
    }

    setCoordSystem(coordSystem: ReadonlyCoordSystem2): void {
        this.batchModify(() => {
            this._position.setVector(coordSystem.position);
            this._xAxis.setVector(coordSystem.xAxis);
            this._yAxis.setVector(coordSystem.yAxis);
        });
    }

    protected batchModify(callback: () => any): void {
        this._enableModifyCallback = false;
        try {
            callback();
        } finally {
            this._enableModifyCallback = true;
            this.onModify.produce(this);
        }
    }
}