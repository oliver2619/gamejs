import { Vector2 } from "./vector2";

export abstract class ReadonlyRectangle {

    abstract readonly x1: number;
	abstract readonly x2: number;
	abstract readonly y1: number;
	abstract readonly y2: number;
	abstract readonly width: number;
	abstract readonly height: number;
	
    get size(): Vector2 {
		return new Vector2(this.width, this.height);
	}
}

export class Rectangle extends ReadonlyRectangle {

    get x2(): number {
		return this.x1 + this.width - 1;
	}

	set x2(x2: number) {
		this.width = x2 - this.x1 + 1;
	}

	get y2(): number {
		return this.y1 + this.height - 1;
	}

	set y2(y2: number) {
		this.height = y2 - this.y1 + 1;
	}

    constructor(public x1: number, public y1: number, public width: number, public height: number) {
        super();
	}

	clone(): Rectangle {
		return new Rectangle(this.x1, this.y1, this.width, this.height);
	}
}