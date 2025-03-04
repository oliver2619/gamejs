import { PatternStyle } from "../../material/pattern-style";
import { Blend2dOperation } from "../../render";
import { PostEffect } from "./post-effect";
import { RenderingContext2d } from "../../component/rendering-context-2d";

export interface PatternPostEffectData {
    pattern: PatternStyle;
    blendOperation: Blend2dOperation;
}

export class PatternPostEffect extends PostEffect {

    blendOperation: Blend2dOperation;

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

    constructor(data: Readonly<PatternPostEffectData>) {
        super();
        this._pattern = data.pattern;
        this.blendOperation = data.blendOperation;
        this._pattern.addReference(this);
    }

    render() {
        RenderingContext2d.renderSafely(ctx => {
            ctx.canvasRenderingContext.globalCompositeOperation = this.blendOperation.value;
            ctx.canvasRenderingContext.fillStyle = this._pattern.getStyle();
            ctx.fill();
        });
    }

    protected onDelete() {
        this._pattern.releaseReference(this);
    }
}