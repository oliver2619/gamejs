import { EventObservable } from "../event/event-observable";
import { Vector2 } from "./vector2";

export abstract class ReadonlyRectangle {

	abstract readonly x1: number;
	abstract readonly x2: number;
	abstract readonly y1: number;
	abstract readonly y2: number;
	abstract readonly width: number;
	abstract readonly height: number;

	get isEmpty(): boolean {
		return this._width <= 0 || this._height <= 0;
	}

	get size(): Vector2 {
		return new Vector2(this._width, this._height);
	}

	constructor(protected _x1: number, protected _y1: number, protected _width: number, protected _height: number) { }

	clone(): Rectangle {
		return new Rectangle(this._x1, this._y1, this._width, this._height);
	}

	equals(o: ReadonlyRectangle): boolean {
		return this._x1 === o._x1 && this._y1 === o._y1 && this._width === o._width && this._height === o._height;
	}
}

export class Rectangle extends ReadonlyRectangle {

	readonly onModify = new EventObservable<ReadonlyRectangle>();

	get x1(): number {
		return this._x1;
	}

	set x1(x1: number) {
		if (this._x1 !== x1) {
			this._x1 = x1;
			this.onModify.produce(this);
		}
	}

	get x2(): number {
		return this._x1 + this._width - 1;
	}

	set x2(x2: number) {
		this.width = x2 - this._x1 + 1;
	}

	get y1(): number {
		return this._y1;
	}

	set y1(y1: number) {
		if (this._y1 !== y1) {
			this._y1 = y1;
			this.onModify.produce(this);
		}
	}

	get y2(): number {
		return this._y1 + this._height - 1;
	}

	set y2(y2: number) {
		this.height = y2 - this._y1 + 1;
	}

	get width(): number {
		return this._width;
	}

	set width(width: number) {
		if (this._width !== width) {
			this._width = width;
			this.onModify.produce(this);
		}
	}

	get height(): number {
		return this._height;
	}

	set height(height: number) {
		if (this._height !== height) {
			this._height = height;
			this.onModify.produce(this);
		}
	}

	constructor(x1: number, y1: number, width: number, height: number) {
		super(x1, y1, width, height);
	}

	override clone(): Rectangle {
		return new Rectangle(this.x1, this.y1, this.width, this.height);
	}

	set(x1: number, y1: number, width: number, height: number) {
		if (this._x1 !== x1 || this._y1 !== y1 || this._width !== width || this._height !== height) {
			this._x1 = x1;
			this._y1 = y1;
			this._width = width;
			this._height = height;
			this.onModify.produce(this);
		}
	}

	setRectangle(r: ReadonlyRectangle) {
		if (this._x1 !== r.x1 || this._y1 !== r.y1 || this._width !== r.width || this._height !== r.height) {
			this._x1 = r.x1;
			this._y1 = r.y1;
			this._width = r.width;
			this._height = r.height;
			this.onModify.produce(this);
		}
	}

}