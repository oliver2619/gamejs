import { ReadonlyRectangle, Rectangle } from "../math/rectangle";
import { ReadonlyVector2d } from "../math/vector-2d";
import { AbstractReferencedObject } from "../reference/abstract-referenced-object";

const defaultMapping = (size: ReadonlyVector2d) => {
    return new Rectangle(0, 0, size.x, size.y);
}

export abstract class Viewport extends AbstractReferencedObject {

    mapping: (size: ReadonlyVector2d) => Rectangle;

    private readonly _rectangle = new Rectangle(0, 0, 0, 0);

    get rectangle(): ReadonlyRectangle {
        return this._rectangle;
    }

    constructor(mapping?: (size: ReadonlyVector2d) => Rectangle) {
        super();
        this.mapping = mapping ?? defaultMapping;
    }

    recalcViewportRect(canvasSize: ReadonlyVector2d): boolean {
        const rect = new Rectangle(0, 0, canvasSize.x, canvasSize.y);
        rect.intersect(this.mapping(canvasSize));
        if (!rect.equals(this._rectangle)) {
            this._rectangle.setRectangle(rect);
            return true;
        } else {
            return false;
        }
    }

    setDefaultMapping() {
        this.mapping = defaultMapping;
    }
}