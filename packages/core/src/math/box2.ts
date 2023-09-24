import { ReadonlyVector2, Vector2 } from "./vector2";

export abstract class ReadonlyBox2 {

	get center(): Vector2 | undefined {
		return this.min == undefined || this.max == undefined ? undefined : this.min.getSum(this.max).getScaled(.5)
	}

	get diameter(): number {
		return this.min == undefined || this.max == undefined ? 0 : this.max.getDistance(this.min)
	}

	get isEmpty(): boolean {
		return this.min == undefined;
	}

	get minimum(): ReadonlyVector2 | undefined {
		return this.min;
	}

	get maximum(): ReadonlyVector2 | undefined {
		return this.max;
	}

	get size(): Vector2 {
		return this.min == undefined || this.max == undefined ? Vector2.Zero() : this.max.getDifference(this.min);
	}

	protected constructor(protected min: Vector2 | undefined, protected max: Vector2 | undefined) { }

	clone(): Box2 {
		return this.min == undefined || this.max == undefined ? Box2.empty() : this.cloneWith(this.min.clone(), this.max.clone());
	}

	getExtendedByBox(box: ReadonlyBox2): Box2 {
		if (box.min == undefined || box.max == undefined)
			return this.clone();
		if (this.min == undefined || this.max == undefined)
			return box.clone();
		return this.cloneWith(
			new Vector2(Math.min(this.min.x, box.min.x), Math.min(this.min.y, box.min.y)),
			new Vector2(Math.max(this.max.x, box.max.x), Math.max(this.max.y, box.max.y)));
	}

	getExtendedByDirection(direction: ReadonlyVector2): Box2 {
		const ret = this.clone();
		ret.extendByDirection(direction);
		return ret;
	}

	getExtendedByPoint(point: ReadonlyVector2): Box2 {
		if (this.min == undefined || this.max == undefined) {
			return this.cloneWith(point.clone(), point.clone());
		} else {
			return this.cloneWith(
				new Vector2(Math.min(this.min.x, point.x), Math.min(this.min.y, point.y)),
				new Vector2(Math.max(this.max.x, point.x), Math.max(this.max.y, point.y))
			);
		}
	}

	getForRotatingObject(position: ReadonlyVector2): Box2 {
		if (this.min == undefined || this.max == undefined)
			return Box2.empty();
		const newSize = this.max.getDifference(this.min).length / 2;
		return this.cloneWith(
			new Vector2(position.x - newSize, position.y - newSize),
			new Vector2(position.x + newSize, position.y + newSize)
		);
	}

	getIntersection(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): Box2 {
		if (this.min == undefined || this.max == undefined)
			return Box2.empty();
		return Box2.withMinAndMax(
			new Vector2(Math.max(this.min.x, x1), Math.max(this.min.y, y1)),
			new Vector2(Math.min(this.max.x, x2), Math.min(this.max.y, y2))
		);
	}

	getIntersectionWithBox(box: ReadonlyBox2): Box2 {
		if (box.min == undefined || box.max == undefined || this.min == undefined || this.max == undefined)
			return Box2.empty();
		return Box2.withMinAndMax(
			new Vector2(Math.max(this.min.x, box.min.x), Math.max(this.min.y, box.min.y)),
			new Vector2(Math.min(this.max.x, box.max.x), Math.min(this.max.y, box.max.y)));
	}

	intersectsBox(box: ReadonlyBox2): boolean {
		if (box.min == undefined || box.max == undefined || this.min == undefined || this.max == undefined)
			return false;
		if (box.max.x < this.min.x || box.max.y < this.min.y)
			return false;
		return box.min.x <= this.max.x && box.min.y <= this.max.y;
	}

	intersectsPoint(point: ReadonlyVector2): boolean {
		if (this.min == undefined || this.max == undefined)
			return false;
		if (point.x < this.min.x || point.y < this.min.y)
			return false;
		return point.x <= this.max.x && point.y <= this.max.y;
	}

	protected abstract cloneWith(min: Vector2, max: Vector2): Box2;
}

export class Box2 extends ReadonlyBox2 {

	private constructor(min: Vector2 | undefined, max: Vector2 | undefined) {
		super(min, max);
	}

	static empty(): Box2 {
		return new Box2(undefined, undefined);
	}

	static fromCircle(position: ReadonlyVector2, radius: number): Box2 {
		return new Box2(new Vector2(position.x - radius, position.y - radius), new Vector2(position.x + radius, position.y + radius));
	}

	static withMinAndMax(min: Vector2, max: Vector2): Box2 {
		const ret = new Box2(min, max);
		ret.validate();
		return ret;
	}

	clear(): void {
		this.min = undefined;
		this.max = undefined;
	}

	extend(x: number, y: number): void {
		if (this.min == undefined || this.max == undefined) {
			this.min = new Vector2(x, y);
			this.max = new Vector2(x, y);
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

	extendByBox(box: ReadonlyBox2): void {
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

	extendByDirection(direction: ReadonlyVector2): void {
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
	}

	extendByPoint(point: ReadonlyVector2): void {
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

	intersect(box: ReadonlyBox2): void {
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

	setBoundingBox(box: ReadonlyBox2): Box2 {
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

	protected cloneWith(min: Vector2, max: Vector2): Box2 {
		return new Box2(min, max);
	}

	protected validate(): void {
		if (this.min != undefined && this.max != undefined && (this.min.x > this.max.x || this.min.y > this.max.y)) {
			this.clear();
		}
	}
}