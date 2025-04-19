import { ReadonlyVector3d, Vector3d } from "./vector-3d";

export interface ReadonlyBox3d {
	center: Vector3d | undefined;
	diameter: number;
	isEmpty: boolean;
	minimum: ReadonlyVector3d | undefined;
	maximum: ReadonlyVector3d | undefined;
	size: Vector3d;
	clone(): Box3d;
	getExtendedByBox(box: ReadonlyBox3d): Box3d;
	getExtendedByDirection(direction: ReadonlyVector3d): Box3d;
	getExtendedByPoint(point: ReadonlyVector3d): Box3d;
	// getForRotatingObject(position: ReadonlyVector3d): Box3;
	getIntersection(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): Box3d;
	getIntersectionWithBox(box: ReadonlyBox3d): Box3d;
	intersectsBox(box: ReadonlyBox3d): boolean;
	intersectsPoint(point: ReadonlyVector3d): boolean;
}

export class Box3d implements ReadonlyBox3d {

	get center(): Vector3d | undefined {
		return this.min == undefined || this.max == undefined ? undefined : this.min.getSum(this.max).getScaled(.5)
	}

	get diameter(): number {
		return this.min == undefined || this.max == undefined ? 0 : this.max.getDistance(this.min)
	}

	get isEmpty(): boolean {
		return this.min == undefined;
	}

	get minimum(): ReadonlyVector3d | undefined {
		return this.min;
	}

	get maximum(): ReadonlyVector3d | undefined {
		return this.max;
	}

	get size(): Vector3d {
		return this.min == undefined || this.max == undefined ? Vector3d.Zero() : this.max.getDifference(this.min);
	}

	private constructor(private min: Vector3d | undefined, private max: Vector3d | undefined) { }

	static empty(): Box3d {
		return new Box3d(undefined, undefined);
	}

	static fromSphere(position: ReadonlyVector3d, radius: number): Box3d {
		return new Box3d(new Vector3d(position.x - radius, position.y - radius, position.z - radius), new Vector3d(position.x + radius, position.y + radius, position.z + radius));
	}

	static withMinAndMax(min: Vector3d, max: Vector3d): Box3d {
		const ret = new Box3d(min, max);
		ret.validate();
		return ret;
	}

	clear(): void {
		this.min = undefined;
		this.max = undefined;
	}

	clone(): Box3d {
		return this.min == undefined || this.max == undefined ? Box3d.empty() : new Box3d(this.min.clone(), this.max.clone());
	}

	extend(x: number, y: number, z: number): void {
		if (this.min == undefined || this.max == undefined) {
			this.min = new Vector3d(x, y, z);
			this.max = new Vector3d(x, y, z);
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

	extendByBox(box: ReadonlyBox3d): void {
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

	extendByDirection(direction: ReadonlyVector3d): void {
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

	extendByPoint(point: ReadonlyVector3d): void {
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

	getExtendedByBox(box: ReadonlyBox3d): Box3d {
		if (box.minimum == undefined || box.maximum == undefined)
			return this.clone();
		if (this.min == undefined || this.max == undefined)
			return box.clone();
		return new Box3d(
			new Vector3d(Math.min(this.min.x, box.minimum.x), Math.min(this.min.y, box.minimum.y), Math.min(this.min.z, box.minimum.z)),
			new Vector3d(Math.max(this.max.x, box.maximum.x), Math.max(this.max.y, box.maximum.y), Math.max(this.max.z, box.maximum.z)));
	}

	getExtendedByDirection(direction: ReadonlyVector3d): Box3d {
		const ret = this.clone();
		ret.extendByDirection(direction);
		return ret;
	}

	getExtendedByPoint(point: ReadonlyVector3d): Box3d {
		if (this.min == undefined || this.max == undefined) {
			return new Box3d(point.clone(), point.clone());
		} else {
			return new Box3d(
				new Vector3d(Math.min(this.min.x, point.x), Math.min(this.min.y, point.y), Math.min(this.min.z, point.z)),
				new Vector3d(Math.max(this.max.x, point.x), Math.max(this.max.y, point.y), Math.max(this.max.z, point.z))
			);
		}
	}

	// this is wrong
	// getForRotatingObject(position: ReadonlyVector3d): Box3 {
	// 	if (this.min == undefined || this.max == undefined)
	// 		return Box3.empty();
	// 	const newSize = this.max.getDifference(this.min).length / 2;
	// 	return this.cloneWith(
	// 		new Vector3d(position.x - newSize, position.y - newSize, position.z - newSize),
	// 		new Vector3d(position.x + newSize, position.y + newSize, position.z + newSize)
	// 	);
	// }

	getIntersection(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): Box3d {
		if (this.min == undefined || this.max == undefined)
			return Box3d.empty();
		return Box3d.withMinAndMax(
			new Vector3d(Math.max(this.min.x, x1), Math.max(this.min.y, y1), Math.max(this.min.z, z1)),
			new Vector3d(Math.min(this.max.x, x2), Math.min(this.max.y, y2), Math.min(this.max.z, z2))
		);
	}

	getIntersectionWithBox(box: ReadonlyBox3d): Box3d {
		if (box.minimum == undefined || box.maximum == undefined || this.min == undefined || this.max == undefined)
			return Box3d.empty();
		return Box3d.withMinAndMax(
			new Vector3d(Math.max(this.min.x, box.minimum.x), Math.max(this.min.y, box.minimum.y), Math.max(this.min.z, box.minimum.z)),
			new Vector3d(Math.min(this.max.x, box.maximum.x), Math.min(this.max.y, box.maximum.y), Math.min(this.max.z, box.maximum.z)));
	}

	intersectsBox(box: ReadonlyBox3d): boolean {
		if (box.minimum == undefined || box.maximum == undefined || this.min == undefined || this.max == undefined)
			return false;
		if (box.maximum.x < this.min.x || box.maximum.y < this.min.y || box.maximum.z < this.min.z)
			return false;
		return box.minimum.x <= this.max.x && box.minimum.y <= this.max.y && box.minimum.z <= this.max.z;
	}

	intersectsPoint(point: ReadonlyVector3d): boolean {
		if (this.min == undefined || this.max == undefined)
			return false;
		if (point.x < this.min.x || point.y < this.min.y || point.z < this.min.z)
			return false;
		return point.x <= this.max.x && point.y <= this.max.y && point.z <= this.max.z;
	}

	intersect(box: ReadonlyBox3d): void {
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

	setBoundingBox(box: ReadonlyBox3d): Box3d {
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

	setCenter(center: ReadonlyVector3d, size: ReadonlyVector3d) {
		this.min = new Vector3d(center.x - size.x * .5, center.y - size.y * .5, center.z - size.z * .5);
		this.max = new Vector3d(center.x + size.x * .5, center.y + size.y * .5, center.z - size.z * .5);
	}

	private validate(): void {
		if (this.min != undefined && this.max != undefined && (this.min.x > this.max.x || this.min.y > this.max.y || this.min.z > this.max.z)) {
			this.clear();
		}
	}
}