import { EventObservable } from "../event/event-observable";
import { ReadonlyVector3, Vector3 } from "./vector3";

export interface CoordSystem3Data {
	position?: ReadonlyVector3;
	axis?: { x: ReadonlyVector3; y: ReadonlyVector3, z: ReadonlyVector3 };
}

export abstract class ReadonlyCoordSystem3 {

	abstract readonly position: Vector3;
	abstract readonly xAxis: Vector3;
	abstract readonly yAxis: Vector3;
	abstract readonly zAxis: Vector3;

	protected readonly _position: Vector3;
	protected readonly _xAxis: Vector3;
	protected readonly _yAxis: Vector3;
	protected readonly _zAxis: Vector3;

	get lookDirection(): Vector3 {
		return this._zAxis.getScaled(-1);
	}

	constructor(data: CoordSystem3Data) {
		this._position = data.position !== undefined ? data.position.clone() : new Vector3(0, 0, 0);
		if (data.axis !== undefined) {
			this._xAxis = data.axis.x.clone();
			this._yAxis = data.axis.y.clone();
			this._zAxis = data.axis.z.clone();
		} else {
			this._xAxis = new Vector3(1, 0, 0);
			this._yAxis = new Vector3(0, 1, 0);
			this._zAxis = new Vector3(0, 0, 1);
		}
	}

	globalToLocal(point: ReadonlyVector3): Vector3 {
		let diff = point.getDifference(this._position);
		return new Vector3(
			diff.getDotProduct(this._xAxis) / this._xAxis.squareLength,
			diff.getDotProduct(this._yAxis) / this._yAxis.squareLength,
			diff.getDotProduct(this._zAxis) / this._zAxis.squareLength);
	}

	globalDirectionToLocal(point: ReadonlyVector3): Vector3 {
		return new Vector3(
			point.getDotProduct(this._xAxis) / this._xAxis.squareLength,
			point.getDotProduct(this._yAxis) / this._yAxis.squareLength,
			point.getDotProduct(this._zAxis) / this._zAxis.squareLength);
	}

	localToGlobal(point: ReadonlyVector3): Vector3 {
		let ret = this._position.clone();
		ret.add(this._xAxis.getScaled(point.x));
		ret.add(this._yAxis.getScaled(point.y));
		ret.add(this._zAxis.getScaled(point.z));
		return ret;
	}

	localDirectionToGlobal(point: ReadonlyVector3): Vector3 {
		let ret = this._xAxis.getScaled(point.x);
		ret.add(this._yAxis.getScaled(point.y));
		ret.add(this._zAxis.getScaled(point.z));
		return ret;
	}

}

export class CoordSystem3 extends ReadonlyCoordSystem3 {

	readonly onModify = new EventObservable<ReadonlyCoordSystem3>();

	private _enableModifyCallback = true;

	get position(): Vector3 {
		return this._position;
	}

	set position(p: Vector3) {
		this._position.setVector(p);
	}

	get xAxis(): Vector3 {
		return this._xAxis;
	}

	set xAxis(a: Vector3) {
		this._xAxis.setVector(a);
	}

	get yAxis(): Vector3 {
		return this._yAxis;
	}

	set yAxis(a: Vector3) {
		this._yAxis.setVector(a);
	}

	get zAxis(): Vector3 {
		return this._zAxis;
	}

	set zAxis(a: Vector3) {
		this._zAxis.setVector(a);
	}

	constructor(data: CoordSystem3Data) {
		super(data);
		const modifyCallback = () => { if (this._enableModifyCallback) { this.onModify.produce(this); } };
		this._position.onModify.subscribe(modifyCallback);
		this._xAxis.onModify.subscribe(modifyCallback);
		this._yAxis.onModify.subscribe(modifyCallback);
		this._zAxis.onModify.subscribe(modifyCallback);
	}

	clone(): CoordSystem3 {
		return new CoordSystem3({
			position: this._position,
			axis: { x: this._xAxis, y: this._yAxis, z: this._zAxis }
		});
	}

	lookAt(target: ReadonlyVector3, up: ReadonlyVector3): void {
		this.setLookDirection(target.getDifference(this._position), up);
	}

	resetRotation(): void {
		this.batchModify(() => {
			this._xAxis.set(1, 0, 0);
			this._yAxis.set(0, 1, 0);
			this._zAxis.set(0, 0, 1);
		});
	}

	rotate(axis: ReadonlyVector3): void {
		this.batchModify(() => {
			this._xAxis.rotate(axis);
			this._yAxis.rotate(axis);
			this._zAxis.rotate(axis);
		});
	}

	setLookDirection(direction: ReadonlyVector3, up: ReadonlyVector3): void {
		this.batchModify(() => {
			this._zAxis.setVector(direction).length = -1;
			this._xAxis.setVector(up.getNormalizedCrossProduct(this._zAxis));
			this._yAxis.setVector(this._zAxis.getCrossProduct(this._xAxis));
		});
	}

	setXY(x: ReadonlyVector3, y: ReadonlyVector3): void {
		this.batchModify(() => {
			this._xAxis.setVector(x).normalize();
			this._zAxis.setVector(x.getNormalizedCrossProduct(y));
			this._yAxis.setVector(this._zAxis.getCrossProduct(this._xAxis));
		});
	}

	setXZ(x: ReadonlyVector3, z: ReadonlyVector3): void {
		this.batchModify(() => {
			this._xAxis.setVector(x).normalize();
			this._yAxis.setVector(z.getNormalizedCrossProduct(this._xAxis));
			this._zAxis.setVector(x.getCrossProduct(this._yAxis));
		});
	}

	setYZ(y: ReadonlyVector3, z: ReadonlyVector3): void {
		this.batchModify(() => {
			this._yAxis.setVector(y).normalize();
			this._xAxis.setVector(y.getNormalizedCrossProduct(z));
			this._zAxis.setVector(this._xAxis.getCrossProduct(this._yAxis));
		});
	}

	setCoordSystem(coordSystem: ReadonlyCoordSystem3): void {
		this.batchModify(() => {
			this._position.setVector(coordSystem.position);
			this._xAxis.setVector(coordSystem.xAxis);
			this._yAxis.setVector(coordSystem.yAxis);
			this._zAxis.setVector(coordSystem.zAxis);
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