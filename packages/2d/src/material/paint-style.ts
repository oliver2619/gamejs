import { AbstractReferencedObject, ReadonlyVector2d } from "@pluto/core";

export abstract class PaintStyle extends AbstractReferencedObject {

    constructor() {
        super();
    }

    abstract clone(): PaintStyle;

    abstract cloneAt(origin: ReadonlyVector2d): PaintStyle;

    abstract getStyle(): string | CanvasGradient | CanvasPattern;
}