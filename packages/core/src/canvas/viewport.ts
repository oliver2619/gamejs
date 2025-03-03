import { ReadonlyRectangle, Rectangle } from "../math/rectangle";
import { ReadonlyVector2d } from "../math/vector-2d";
import { ReferencedObject, ReferencedObjects } from "../reference";

const defaultMapping = (size: ReadonlyVector2d) => {
    return new Rectangle(0, 0, size.x, size.y);
}

export abstract class Viewport implements ReferencedObject {

    mapping: (size: ReadonlyVector2d) => Rectangle;

    private readonly referencedObject = ReferencedObjects.create(() => this.onDestroy());
    private readonly _rectangle = new Rectangle(0, 0, 0, 0);

    get rectangle(): ReadonlyRectangle {
        return this._rectangle;
    }

    constructor(mapping?: (size: ReadonlyVector2d) => Rectangle) {
        this.mapping = mapping ?? defaultMapping;
    }

    addReference(owner: any): void {
        this.referencedObject.addReference(owner);
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

    releaseReference(owner: any): void {
        this.referencedObject.releaseReference(owner);
    }

    setDefaultMapping() {
        this.mapping = defaultMapping;
    }

    protected abstract onDestroy(): void;
}