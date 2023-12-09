import { EventObservable } from "../event/event-observable";

export abstract class ReadonlyVector3 {
    
	abstract readonly x: number;
	abstract readonly y: number;
	abstract readonly z: number;
	abstract readonly length: number;

	get isZero(): boolean {
		return this._x === 0 && this._y === 0 && this._z === 0;
	}

	get normal(): Vector3 {
		const v1 = new Vector3(this._y - this._z, this._z - this._x, this._x - this._y);
		const v2 = new Vector3(this._y + this._z, -this._z - this._x, -this._x + this._y);
		const l1 = v1.squareLength;
		const l2 = v2.squareLength;
		return l1 > l2 ? v1.getScaled(1 / Math.sqrt(l1)) : v2.getScaled(1 / Math.sqrt(l2));
	}

	get squareLength(): number {
		return this._x * this._x + this._y * this._y + this._z * this._z;
	}

	constructor(protected _x: number, protected _y: number, protected _z: number) { }

	clone(): Vector3 {
		return new Vector3(this._x, this._y, this._z);
	}

	equals(v: ReadonlyVector3): boolean {
		return this._x === v.x && this._y === v.y && this._z === v.z;
	}

	getCrossProduct(v: ReadonlyVector3): Vector3 {
		return new Vector3(this._y * v.z - this._z * v.y, this._z * v.x - this._x * v.z, this._x * v.y - this._y * v.x);
	}

	getDifference(v: ReadonlyVector3): Vector3 {
		return new Vector3(this._x - v.x, this._y - v.y, this._z - v.z);
	}

	getDirectionFrom(v: ReadonlyVector3): Vector3 {
		const x = this._x - v.x;
		const y = this._y - v.y;
		const z = this._z - v.z;
		let l = x * x + y * y + z * z;
		if (l > 0) {
			l = 1 / Math.sqrt(l);
			return new Vector3(x * l, y * l, z * l);
		} else {
			return new Vector3(x, y, z);
		}
	}

	getDistance(v: ReadonlyVector3): number {
		const dx = this._x - v.x;
		const dy = this._y - v.y;
		const dz = this._z - v.z;
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	}

	getDotProduct(v: ReadonlyVector3): number {
		return this._x * v.x + this._y * v.y + this._z * v.z;
	}

	getInterpolated(v: ReadonlyVector3, f: number): Vector3 {
		const g = 1 - f;
		return new Vector3(this._x * g + v.x * f, this._y * g + v.y * f, this._z * g + v.z * f);
	}

	getNormalized(): Vector3 {
		let l = this.squareLength;
		if (l > 0) {
			l = 1 / Math.sqrt(l);
			return new Vector3(this._x * l, this._y * l, this._z * l);
		} else
			return this.clone();
	}

	getNormalizedCrossProduct(v: ReadonlyVector3): Vector3 {
		const x = this._y * v.z - this._z * v.y;
		const y = this._z * v.x - this._x * v.z;
		const z = this._x * v.y - this._y * v.x;
		let l = x * x + y * y + z * z;
		if (l > 0) {
			l = 1 / Math.sqrt(l);
			return new Vector3(x * l, y * l, z * l);
		} else {
			return new Vector3(x, y, z);
		}
	}

	getProjected(v: ReadonlyVector3): Vector3 {
		const dot = this.getDotProduct(v);
		return v.getScaled(dot / v.squareLength);
	}

	getRotated(axis: ReadonlyVector3): Vector3 {
		let angle = axis.length;
		if (angle > 0) {
			const normAxis = axis.getScaled(1 / angle);
			const ax2 = normAxis.getCrossProduct(this);
			const ax1 = ax2.getCrossProduct(normAxis);
			const ret = normAxis.getScaled(normAxis.getDotProduct(this));
			ret.add(ax1.getScaled(Math.cos(angle)));
			ret.add(ax2.getScaled(Math.sin(angle)));
			return ret;
		} else
			return this.clone();
	}

	getScaled(f: number): Vector3 {
		return new Vector3(this._x * f, this._y * f, this._z * f);
	}

	getSum(v: ReadonlyVector3): Vector3 {
		return new Vector3(this._x + v.x, this._y + v.y, this._z + v.z);
	}

	getSumScaled(v: ReadonlyVector3, f: number): Vector3 {
		return new Vector3(this._x + v.x * f, this._y + v.y * f, this._z + v.z * f);
	}

	getWithLength(len: number): Vector3 {
		let l = this.squareLength;
		if (l > 0) {
			l = len / Math.sqrt(l);
			return new Vector3(this._x * l, this._y * l, this._z * l);
		} else
			return this.clone();
	}

	toString(): string { return `Vector3(${this._x}, ${this._y}, ${this._z})` }
}

export class Vector3 extends ReadonlyVector3 {

	readonly onModify = new EventObservable<ReadonlyVector3>();

	get length(): number {
		return Math.sqrt(this.squareLength);
	}

	set length(l: number) {
		let ls = this.squareLength;
		if (ls > 0) {
			const f = l / Math.sqrt(ls);
			this._x *= f;
			this._y *= f;
			this._z *= f;
			this.onModify.produce(this);
		}
	}

	get x(): number {
		return this._x;
	}

	set x(x: number) {
		if (this._x !== x) {
			this._x = x;
			this.onModify.produce(this);
		}
	}

	get y(): number {
		return this._y;
	}

	set y(y: number) {
		if (this._y !== y) {
			this._y = y;
			this.onModify.produce(this);
		}
	}

	get z(): number {
		return this._z;
	}

	set z(z: number) {
		if (this._z !== z) {
			this._z = z;
			this.onModify.produce(this);
		}
	}

	constructor(x: number, y: number, z: number) {
		super(x, y, z);
	}

	static Zero(): Vector3 {
		return new Vector3(0, 0, 0);
	}

	add(v: ReadonlyVector3): Vector3 {
		if (!v.isZero) {
			this._x += v.x;
			this._y += v.y;
			this._z += v.z;
			this.onModify.produce(this);
		}
		return this;
	}

	addScaled(v: ReadonlyVector3, f: number): Vector3 {
		if (!v.isZero && f !== 0) {
			this._x += v.x * f;
			this._y += v.y * f;
			this._z += v.z * f;
			this.onModify.produce(this);
		}
		return this;
	}

	normalize(): number {
		let l = this.squareLength;
		if (l > 0 && l !== 1) {
			l = Math.sqrt(l);
			const f = 1 / l;
			this._x *= f;
			this._y *= f;
			this._z *= f;
			this.onModify.produce(this);
			return l;
		} else
			return 0;
	}

	project(v: ReadonlyVector3): Vector3 {
		const dot = this.getDotProduct(v) / v.squareLength;
		return this.set(v.x * dot, v.y * dot, v.z * dot);
	}

	rotate(axis: ReadonlyVector3): Vector3 {
		let angle = axis.length;
		if (angle > 0) {
			const normAxis = axis.getScaled(1 / angle);
			const ax2 = normAxis.getCrossProduct(this);
			const ax1 = ax2.getCrossProduct(normAxis);
			const newV = normAxis.getScaled(normAxis.getDotProduct(this));
			newV.addScaled(ax1, Math.cos(angle));
			newV.addScaled(ax2, Math.sin(angle));
			this.setVector(newV);
		}
		return this;
	}

	scale(f: number): Vector3 {
		if (f !== 1) {
			this._x *= f;
			this._y *= f;
			this._z *= f;
			this.onModify.produce(this);
		}
		return this;
	}

	set(x: number, y: number, z: number): Vector3 {
		if (x !== this._x || y !== this._y || z !== this._z) {
			this._x = x;
			this._y = y;
			this._z = z;
			this.onModify.produce(this);
		}
		return this;
	}

	setScaled(v: ReadonlyVector3, f: number): Vector3 {
		return this.set(v.x * f, v.y * f, v.z * f);
	}

	setVector(v: ReadonlyVector3): Vector3 {
		return this.set(v.x, v.y, v.z);
	}
}