import { ImagePattern } from "./image-pattern";
import { PaintStyle } from "./paint-style";

export class PatternStyle extends PaintStyle {

    private _pattern: ImagePattern;

    get pattern(): ImagePattern {
        return this._pattern;
    }

    set pattern(p: ImagePattern) {
        if (this._pattern !== p) {
            this._pattern.releaseReference(this);
            this._pattern = p;
            this._pattern.addReference(this);
        }
    }

    constructor(pattern: ImagePattern) {
        super();
        this._pattern = pattern;
        this._pattern.addReference(this);
    }

    clone(): PatternStyle {
        return new PatternStyle(this._pattern);
    }

    getStyle(context: CanvasRenderingContext2D): string | CanvasGradient | CanvasPattern {
        return this._pattern.getFillOrStrokeStyle(context);
    }

    protected onDispose(): void {
        this._pattern.releaseReference(this);
    }
}