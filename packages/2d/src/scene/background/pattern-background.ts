import { GarbageCollectibleObject } from "core/src/index";
import { Background } from "./background";
import { RenderingContext2d } from "../../render/rendering-context2d";
import { Filter } from "../../render/filter";
import { ImagePattern } from "../../material/image-pattern";

export interface PatternBackgroundData {
    readonly alpha?: number;
    readonly pattern: ImagePattern;
}

export class PatternBackground implements Background {

    alpha = 1;
    filter = new Filter();

    private readonly reference = new GarbageCollectibleObject(() => this.onDispose());

    private _pattern: ImagePattern;

    get hasReferences(): boolean {
        return this.reference.hasReferences;
    }

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

    constructor(data: PatternBackgroundData) {
        this.alpha = data.alpha == undefined ? 1 : data.alpha;
        this._pattern = data.pattern;
        this._pattern.addReference(this);
    }

    addReference(holder: any) {
        this.reference.addReference(holder);
    }

    releaseReference(holder: any) {
        this.reference.releaseReference(holder);
    }

    render(context: RenderingContext2d) {
        context.withFilter(this.filter, ctx => {
            if (this._pattern.alpha || this.alpha < 1 || this._pattern.repetition !== 'repeat') {
                ctx.clear()
            }
            ctx.context.globalAlpha *= this.alpha;
            this.filter.use(ctx.context);
            this._pattern.useFill(context);
            ctx.fill();
        });
    }

    private onDispose() {
        this._pattern.releaseReference(this);
    }
}