import { ReadonlyVector2d, Vector2d } from "./vector-2d";

export interface ReadonlyBox2d {
	readonly center: Vector2d | undefined;
	readonly diameter: number;
	readonly isEmpty: boolean;
	readonly minimum: ReadonlyVector2d | undefined;
	readonly maximum: ReadonlyVector2d | undefined;
	readonly size: Vector2d;
	clone(): Box2d;
	getExtendedByBox(box: ReadonlyBox2d): Box2d;
	getExtendedByDirection(direction: ReadonlyVector2d): Box2d;
	getExtendedByPoint(point: ReadonlyVector2d): Box2d;
	// getForRotatingObject(position: ReadonlyVector2d): Box2;
	getIntersection(x1: number, y1: number, x2: number, y2: number): Box2d;
	getIntersectionWithBox(box: ReadonlyBox2d): Box2d;
	intersectsBox(box: ReadonlyBox2d): boolean;
	intersectsPoint(point: ReadonlyVector2d): boolean;
}

export class Box2d implements ReadonlyBox2d {

	get center(): Vector2d | undefined {
		return this.min == undefined || this.max == undefined ? undefined : this.min.getSum(this.max).getScaled(.5)
	}

	get diameter(): number {
		return this.min == undefined || this.max == undefined ? 0 : this.max.getDistance(this.min)
	}

	get isEmpty(): boolean {
		return this.min == undefined;
	}

	get minimum(): ReadonlyVector2d | undefined {
		return this.min;
	}

	get maximum(): ReadonlyVector2d | undefined {
		return this.max;
	}

	get size(): Vector2d {
		return this.min == undefined || this.max == undefined ? Vector2d.Zero() : this.max.getDifference(this.min);
	}

	private constructor(private min: Vector2d | undefined, private max: Vector2d | undefined) {
	}

	static empty(): Box2d {
		return new Box2d(undefined, undefined);
	}

	static fromCircle(position: ReadonlyVector2d, radius: number): Box2d {
		return new Box2d(new Vector2d(position.x - radius, position.y - radius), new Vector2d(position.x + radius, position.y + radius));
	}

	static withMinAndMax(min: Vector2d, max: Vector2d): Box2d {
		const ret = new Box2d(min, max);
		ret.validate();
		return ret;
	}

	clear() {
		this.min = undefined;
		this.max = undefined;
	}

	clone(): Box2d {
		return this.min == undefined || this.max == undefined ? Box2d.empty() : new Box2d(this.min.clone(), this.max.clone());
	}

	extend(x: number, y: number) {
		if (this.min == undefined || this.max == undefined) {
			this.min = new Vector2d(x, y);
			this.max = new Vector2d(x, y);
		} else {
			if (x < this.min.x)
				this.min.x = x;
			if (y < this.min.y)
				this.min.y = y;
			if (x > this.max.x)
				this.max.x = x;
			if (y > this.max.y)
				this.max.y = y;
		}
	}

	extendByBox(box: ReadonlyBox2d) {
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
			if (box.maximum.x > this.max.x)
				this.max.x = box.maximum.x;
			if (box.maximum.y > this.max.y)
				this.max.y = box.maximum.y;
		}
	}

	extendByDirection(direction: ReadonlyVector2d) {
		if (this.min != undefined && this.max != undefined) {
			if (direction.x < 0)
				this.min.x += direction.x;
			else
				this.max.x += direction.x;
			if (direction.y < 0)
				this.min.y += direction.y;
			else
				this.max.y += direction.y;
		}
	}

	extendByPoint(point: ReadonlyVector2d) {
		if (this.min == undefined || this.max == undefined) {
			this.min = point.clone();
			this.max = point.clone();
		} else {
			if (point.x < this.min.x)
				this.min.x = point.x;
			if (point.y < this.min.y)
				this.min.y = point.y;
			if (point.x > this.max.x)
				this.max.x = point.x;
			if (point.y > this.max.y)
				this.max.y = point.y;
		}
	}

	extendEveryDirection(amount: number) {
		if (amount > 0 && this.min != undefined && this.max != undefined) {
			this.min.x -= amount;
			this.min.y -= amount;
			this.max.x += amount;
			this.max.y += amount;
		}
	}

	getExtendedByBox(box: ReadonlyBox2d): Box2d {
		if (box.minimum == undefined || box.maximum == undefined)
			return this.clone();
		if (this.min == undefined || this.max == undefined)
			return box.clone();
		return new Box2d(
			new Vector2d(Math.min(this.min.x, box.minimum.x), Math.min(this.min.y, box.minimum.y)),
			new Vector2d(Math.max(this.max.x, box.maximum.x), Math.max(this.max.y, box.maximum.y)));
	}

	getExtendedByDirection(direction: ReadonlyVector2d): Box2d {
		const ret = this.clone();
		ret.extendByDirection(direction);
		return ret;
	}

	getExtendedByPoint(point: ReadonlyVector2d): Box2d {
		if (this.min == undefined || this.max == undefined) {
			return new Box2d(point.clone(), point.clone());
		} else {
			return new Box2d(
				new Vector2d(Math.min(this.min.x, point.x), Math.min(this.min.y, point.y)),
				new Vector2d(Math.max(this.max.x, point.x), Math.max(this.max.y, point.y))
			);
		}
	}

	// this is wrong
	// getForRotatingObject(position: ReadonlyVector2d): Box2 {
	// 	if (this.min == undefined || this.max == undefined)
	// 		return Box2.empty();
	// 	const newSize = this.max.getDifference(this.min).length / 2;
	// 	return this.cloneWith(
	// 		new Vector2(position.x - newSize, position.y - newSize),
	// 		new Vector2(position.x + newSize, position.y + newSize)
	// 	);
	// }

	getIntersection(x1: number, y1: number, x2: number, y2: number): Box2d {
		if (this.min == undefined || this.max == undefined)
			return Box2d.empty();
		return Box2d.withMinAndMax(
			new Vector2d(Math.max(this.min.x, x1), Math.max(this.min.y, y1)),
			new Vector2d(Math.min(this.max.x, x2), Math.min(this.max.y, y2))
		);
	}

	getIntersectionWithBox(box: ReadonlyBox2d): Box2d {
		if (box.minimum == undefined || box.maximum == undefined || this.min == undefined || this.max == undefined)
			return Box2d.empty();
		return Box2d.withMinAndMax(
			new Vector2d(Math.max(this.min.x, box.minimum.x), Math.max(this.min.y, box.minimum.y)),
			new Vector2d(Math.min(this.max.x, box.maximum.x), Math.min(this.max.y, box.maximum.y)));
	}

	intersect(box: ReadonlyBox2d) {
		if (box.minimum == undefined || box.maximum == undefined || this.min == undefined || this.max == undefined)
			return;
		if (this.min.x < box.minimum.x)
			this.min.x = box.minimum.x;
		if (this.min.y < box.minimum.y)
			this.min.y = box.minimum.y;
		if (this.max.x > box.maximum.x)
			this.max.x = box.maximum.x;
		if (this.max.y > box.maximum.y)
			this.max.y = box.maximum.y;
		this.validate();
	}

	intersectsBox(box: ReadonlyBox2d): boolean {
		if (box.minimum == undefined || box.maximum == undefined || this.min == undefined || this.max == undefined)
			return false;
		if (box.maximum.x < this.min.x || box.maximum.y < this.min.y)
			return false;
		return box.minimum.x <= this.max.x && box.minimum.y <= this.max.y;
	}

	intersectsPoint(point: ReadonlyVector2d): boolean {
		if (this.min == undefined || this.max == undefined)
			return false;
		if (point.x < this.min.x || point.y < this.min.y)
			return false;
		return point.x <= this.max.x && point.y <= this.max.y;
	}

	setBoundingBox(box: ReadonlyBox2d): Box2d {
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

	setCenter(center: ReadonlyVector2d, size: ReadonlyVector2d) {
		this.min = new Vector2d(center.x - size.x, center.y - size.y);
		this.max = new Vector2d(center.x + size.x, center.y + size.y);
	}

	private validate() {
		if (this.min != undefined && this.max != undefined && (this.min.x > this.max.x || this.min.y > this.max.y)) {
			this.clear();
		}
	}
}