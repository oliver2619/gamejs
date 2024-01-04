import { GarbageCollectibleObject } from "core";
import { ImagePattern } from "../../material/image-pattern";
import { RenderingContext2d } from "../../render/rendering-context2d";
import { PostEffect } from "./post-effect";
import { CompositeOperation } from "../../render/composite-operation";

export interface PatternPostEffectData {
    readonly pattern: ImagePattern;
    readonly compositeOperation: CompositeOperation;
}

export class PatternPostEffect implements PostEffect {

    compositeOperation: CompositeOperation;

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

    constructor(data: PatternPostEffectData) {
        this._pattern = data.pattern;
        this.compositeOperation = data.compositeOperation;
        this._pattern.addReference(this);
    }

    addReference(holder: any) {
        this.reference.addReference(holder);
    }

    releaseReference(holder: any) {
        this.reference.releaseReference(holder);
    }

    render(context: RenderingContext2d) {
        context.renderSafely(ctx => {
            ctx.context.globalCompositeOperation = this.compositeOperation.value;
            this._pattern.useFill(context);
            ctx.fill();
        });
    }

    private onDispose() {
        this._pattern.releaseReference(this);
    }
}