import {GarbageCollectibleObject, ImageResource} from "core/src/index";
import {Background} from "./background";
import {RenderingContext2d} from "../../rendering-context2d";
import {Filter} from "../../filter";

export interface PatternBackgroundData {
    readonly alpha?: number;
    readonly image: ImageResource;
}

export class PatternBackground implements Background {

    alpha = 1;
    filter = new Filter();

    private readonly reference = new GarbageCollectibleObject(() => this.onDispose());

    private _image: ImageResource;
    private modified = true;
    private pattern: CanvasPattern | undefined;

    get hasReferences(): boolean {
        return this.reference.hasReferences;
    }

    get image(): ImageResource {
        return this._image;
    }

    set image(i: ImageResource) {
        if (this._image !== i) {
            this._image.releaseReference(this);
            this._image = i;
            this._image.addReference(this);
            this.modified = true;
        }
    }

    constructor(data: PatternBackgroundData) {
        this.alpha = data.alpha == undefined ? 1 : data.alpha;
        this._image = data.image;
        this._image.addReference(this);
    }

    addReference(holder: any) {
        this.reference.addReference(holder);
    }

    releaseReference(holder: any) {
        this.reference.releaseReference(holder);
    }

    render(context: RenderingContext2d) {
        context.withFilter(this.filter, ctx => {
            if (this._image.alpha || this.alpha < 1) {
                ctx.clear()
            }
            ctx.context.globalAlpha *= this.alpha;
            this.filter.use(ctx.context);
            this.updateAndUsePattern(ctx);
            ctx.fill();
        });
    }

    private onDispose() {
        this._image.releaseReference(this);
    }

    private updateAndUsePattern(context: RenderingContext2d) {
        if (this.pattern == undefined || this.modified) {
            const pattern = context.context.createPattern(this._image.image, "repeat");
            if(pattern == null) {
                throw new Error('Failed to create pattern');
            }
            this.pattern = pattern;
            this.modified = false;
        }
        context.context.fillStyle = this.pattern;
    }
}