import { Background } from "./background";
import { PatternStyle } from "../../material";
import { Filter, FilterStack } from "../../render/filter";
import { RenderingContext2d } from "../../component/rendering-context-2d";

export interface PatternBackgroundData {
    readonly alpha?: number;
    readonly pattern: PatternStyle;
    readonly filter?: Filter;
}

export class PatternBackground extends Background {

    alpha: number;
    filter: Filter;

    private _pattern: PatternStyle;

    get pattern(): PatternStyle {
        return this._pattern;
    }

    set pattern(p: PatternStyle) {
        if (this._pattern !== p) {
            this._pattern.releaseReference(this);
            this._pattern = p;
            this._pattern.addReference(this);
        }
    }

    constructor(data: PatternBackgroundData) {
        super();
        this.alpha = data.alpha ?? 1;
        this.filter = data.filter == undefined ? FilterStack.createDefaultFilter() : { ...data.filter };
        this._pattern = data.pattern;
        this._pattern.addReference(this);
    }

    render(): void {
        RenderingContext2d.withFilter(this.filter, ctx => {
            if (this._pattern.isTransparent || this.alpha < 1 || this._pattern.repetition !== 'repeat') {
                ctx.clear()
            }
            ctx.canvasRenderingContext.globalAlpha *= this.alpha;
            ctx.canvasRenderingContext.fillStyle = this._pattern.getStyle();
            ctx.fill();
        });
    }

    protected onDelete() {
        this._pattern.releaseReference(this);
    }
}