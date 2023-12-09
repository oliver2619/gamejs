import { ReadonlyVector3, Vector3 } from "./vector3";

export abstract class ReadonlyBox3 {

	get center(): Vector3 | undefined {
		return this.min == undefined || this.max == undefined ? undefined : this.min.getSum(this.max).getScaled(.5)
	}

	get diameter(): number {
		return this.min == undefined || this.max == undefined ? 0 : this.max.getDistance(this.min)
	}

	get isEmpty(): boolean {
		return this.min == undefined;
	}

	get minimum(): ReadonlyVector3 | undefined {
		return this.min;
	}

	get maximum(): ReadonlyVector3 | undefined {
		return this.max;
	}

	get size(): Vector3 {
		return this.min == undefined || this.max == undefined ? Vector3.Zero() : this.max.getDifference(this.min);
	}

	protected constructor(protected min: Vector3 | undefined, protected max: Vector3 | undefined) { }

	clone(): Box3 {
		return this.min == undefined || this.max == undefined ? Box3.empty() : this.cloneWith(this.min.clone(), this.max.clone());
	}

	getExtendedByBox(box: ReadonlyBox3): Box3 {
		if (box.min == undefined || box.max == undefined)
			return this.clone();
		if (this.min == undefined || this.max == undefined)
			return box.clone();
		return this.cloneWith(
			new Vector3(Math.min(this.min.x, box.min.x), Math.min(this.min.y, box.min.y), Math.min(this.min.z, box.min.z)),
			new Vector3(Math.max(this.max.x, box.max.x), Math.max(this.max.y, box.max.y), Math.max(this.max.z, box.max.z)));
	}

	getExtendedByDirection(direction: ReadonlyVector3): Box3 {
		const ret = this.clone();
		ret.extendByDirection(direction);
		return ret;
	}

	getExtendedByPoint(point: ReadonlyVector3): Box3 {
		if (this.min == undefined || this.max == undefined) {
			return this.cloneWith(point.clone(), point.clone());
		} else {
			return this.cloneWith(
				new Vector3(Math.min(this.min.x, point.x), Math.min(this.min.y, point.y), Math.min(this.min.z, point.z)),
				new Vector3(Math.max(this.max.x, point.x), Math.max(this.max.y, point.y), Math.max(this.max.z, point.z))
			);
		}
	}

	// this is wrong
	// getForRotatingObject(position: ReadonlyVector3): Box3 {
	// 	if (this.min == undefined || this.max == undefined)
	// 		return Box3.empty();
	// 	const newSize = this.max.getDifference(this.min).length / 2;
	// 	return this.cloneWith(
	// 		new Vector3(position.x - newSize, position.y - newSize, position.z - newSize),
	// 		new Vector3(position.x + newSize, position.y + newSize, position.z + newSize)
	// 	);
	// }

	getIntersection(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): Box3 {
		if (this.min == undefined || this.max == undefined)
			return Box3.empty();
		return Box3.withMinAndMax(
			new Vector3(Math.max(this.min.x, x1), Math.max(this.min.y, y1), Math.max(this.min.z, z1)),
			new Vector3(Math.min(this.max.x, x2), Math.min(this.max.y, y2), Math.min(this.max.z, z2))
		);
	}

	getIntersectionWithBox(box: ReadonlyBox3): Box3 {
		if (box.min == undefined || box.max == undefined || this.min == undefined || this.max == undefined)
			return Box3.empty();
		return Box3.withMinAndMax(
			new Vector3(Math.max(this.min.x, box.min.x), Math.max(this.min.y, box.min.y), Math.max(this.min.z, box.min.z)),
			new Vector3(Math.min(this.max.x, box.max.x), Math.min(this.max.y, box.max.y), Math.min(this.max.z, box.max.z)));
	}

	intersectsBox(box: ReadonlyBox3): boolean {
		if (box.min == undefined || box.max == undefined || this.min == undefined || this.max == undefined)
			return false;
		if (box.max.x < this.min.x || box.max.y < this.min.y || box.max.z < this.min.z)
			return false;
		return box.min.x <= this.max.x && box.min.y <= this.max.y && box.min.z <= this.max.z;
	}

	intersectsPoint(point: ReadonlyVector3): boolean {
		if (this.min == undefined || this.max == undefined)
			return false;
		if (point.x < this.min.x || point.y < this.min.y || point.z < this.min.z)
			return false;
		return point.x <= this.max.x && point.y <= this.max.y && point.z <= this.max.z;
	}

	protected abstract cloneWith(min: Vector3, max: Vector3): Box3;
}

export class Box3 extends ReadonlyBox3 {

	private constructor(min: Vector3 | undefined, max: Vector3 | undefined) {
		super(min, max);
	}

	static empty(): Box3 {
		return new Box3(undefined, undefined);
	}

	static fromSphere(position: ReadonlyVector3, radius: number): Box3 {
		return new Box3(new Vector3(position.x - radius, position.y - radius, position.z - radius), new Vector3(position.x + radius, position.y + radius, position.z + radius));
	}

	static withMinAndMax(min: Vector3, max: Vector3): Box3 {
		const ret = new Box3(min, max);
		ret.validate();
		return ret;
	}

	clear(): void {
		this.min = undefined;
		this.max = undefined;
	}

	extend(x: number, y: number, z: number): void {
		if (this.min == undefined || this.max == undefined) {
			this.min = new Vector3(x, y, z);
			this.max = new Vector3(x, y, z);
		} else {
			if (x < this.min.x)
				this.min.x = x;
			if (y < this.min.y)
				this.min.y = y;
			if (z < this.min.z)
				this.min.z = z;
			if (x > this.max.x)
				this.max.x = x;
			if (y > this.max.y)
				this.max.y = y;
			if (z > this.max.z)
				this.max.z = z;
		}
	}

	extendByBox(box: ReadonlyBox3): void {
		if (box.minimum == undefined || box.maximum == undefined) {
			return;
		}
		if (this.min == undefined || this.max == undefined) {
			this.min = box.minimum.clone();
			this.max = box.maximum.clone();
		} else {
			if (box.minimum.x < this.min.x)
				this.min.x = box.minimum.x;
			if (box.minimum.y < this.min.y)
				this.min.y = box.minimum.y;
			if (box.minimum.z < this.min.z)
				this.min.z = box.minimum.z;
			if (box.maximum.x > this.max.x)
				this.max.x = box.maximum.x;
			if (box.maximum.y > this.max.y)
				this.max.y = box.maximum.y;
			if (box.maximum.z > this.max.z)
				this.max.z = box.maximum.z;
		}
	}

	extendByDirection(direction: ReadonlyVector3): void {
		if (this.min == undefined || this.max == undefined) {
			throw new Error('Box is empty');
		}
		if (direction.x < 0)
			this.min.x += direction.x;
		else
			this.max.x += direction.x;
		if (direction.y < 0)
			this.min.y += direction.y;
		else
			this.max.y += direction.y;
		if (direction.z < 0)
			this.min.z += direction.z;
		else
			this.max.z += direction.z;
	}

	extendByPoint(point: ReadonlyVector3): void {
		if (this.min == undefined || this.max == undefined) {
			this.min = point.clone();
			this.max = point.clone();
		} else {
			if (point.x < this.min.x)
				this.min.x = point.x;
			if (point.y < this.min.y)
				this.min.y = point.y;
			if (point.z < this.min.z)
				this.min.z = point.z;
			if (point.x > this.max.x)
				this.max.x = point.x;
			if (point.y > this.max.y)
				this.max.y = point.y;
			if (point.z > this.max.z)
				this.max.z = point.z;
		}
	}

	intersect(box: ReadonlyBox3): void {
		if (box.minimum == undefined || box.maximum == undefined || this.min == undefined || this.max == undefined)
			return;
		if (this.min.x < box.minimum.x)
			this.min.x = box.minimum.x;
		if (this.min.y < box.minimum.y)
			this.min.y = box.minimum.y;
		if (this.min.z < box.minimum.z)
			this.min.z = box.minimum.z;
		if (this.max.x > box.maximum.x)
			this.max.x = box.maximum.x;
		if (this.max.y > box.maximum.y)
			this.max.y = box.maximum.y;
		if (this.max.z > box.maximum.z)
			this.max.z = box.maximum.z;
		this.validate();
	}

	setBoundingBox(box: ReadonlyBox3): Box3 {
		if (this.min == undefined || this.max == undefined) {
			if (box.minimum != undefined && box.maximum != undefined) {
				this.min = box.minimum.clone();
				this.max = box.maximum.clone();
			}
		} else {
			if (box.minimum == undefined || box.maximum == undefined) {
				this.clear();
			} else {
				this.min.setVector(box.minimum);
				this.max.setVector(box.maximum);
			}
		}
		return this;
	}

	protected cloneWith(min: Vector3, max: Vector3): Box3 {
		return new Box3(min, max);
	}

	protected validate(): void {
		if (this.min != undefined && this.max != undefined && (this.min.x > this.max.x || this.min.y > this.max.y || this.min.z > this.max.z)) {
			this.clear();
		}
	}
}