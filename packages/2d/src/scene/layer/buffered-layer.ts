import { Context2d } from "../../component/context-2d";
import { RenderingContext2d } from "../../component/rendering-context-2d";
import { Blend2dOperation } from "../../render/blend-2d-operation";
import { Filter, FilterStack } from "../../render/filter";
import { EmptyPostEffect } from "../post-effect/empty-post-effect";
import { PostEffect } from "../post-effect/post-effect";
import { Layer, LayerData } from "./layer";

export interface BufferedLayerData extends LayerData {
    layer: Layer;
    autoUpdate: boolean;
    alpha?: number;
    blendOperation?: Blend2dOperation;
    filter?: Partial<Filter>;
    postEffect?: PostEffect;
}

export class BufferedLayer extends Layer {

    alpha: number;
    autoUpdate: boolean;
    filter: Filter;

    private _layer: Layer;
    private _blendOperation: Blend2dOperation;
    private _postEffect: PostEffect;
    private ownContext: Context2d | undefined;
    private needsUpdate = false;
    private filterStack = new FilterStack();

    get blendOperation(): Blend2dOperation {
        return this._blendOperation;
    }

    set blendOperation(o: Blend2dOperation) {
        if (this._blendOperation !== o) {
            this._blendOperation = o;
            this.needsUpdate = true;
        }
    }

    get layer(): Layer {
        return this._layer;
    }

    set layer(l: Layer) {
        if (this._layer !== l) {
            this._layer.releaseReference(this);
            this._layer = l;
            this._layer.addReference(this);
            this.needsUpdate = true;
        }
    }

    get postEffect(): PostEffect {
        return this._postEffect;
    }

    set postEffect(p: PostEffect) {
        if (this._postEffect !== p) {
            this._postEffect.releaseReference(this);
            this._postEffect = p;
            this._postEffect.addReference(this);
            this.needsUpdate = true;
        }
    }

    constructor(data: BufferedLayerData) {
        super(data);
        this._layer = data.layer;
        this.alpha = data.alpha ?? 1;
        this.autoUpdate = data.autoUpdate;
        this._blendOperation = data.blendOperation ?? Blend2dOperation.NORMAL;
        this._postEffect = data.postEffect ?? new EmptyPostEffect();
        this.filter = data.filter == undefined ? FilterStack.createDefaultFilter() : FilterStack.createPartialFilter(data.filter);
        this._layer.addReference(this);
        this._postEffect.addReference(this);
    }

    getAlpha(x: number, y: number, defaultAlpha: number): number {
        return this.ownContext?.getAlpha(x, y, defaultAlpha) ?? defaultAlpha;
    }

    preRender(): void {
        if (!this.visible) {
            return;
        }
        this.checkViewportSize();
        if (this.autoUpdate || this.needsUpdate) {
            this.renderBackBuffer();
            this.needsUpdate = false;
        }
    }

    render(): void {
        if (this.visible && this.ownContext != undefined) {
            RenderingContext2d.withFilter(this.filter, ctx => {
                ctx.canvasRenderingContext.globalAlpha *= this.alpha;
                ctx.canvasRenderingContext.globalCompositeOperation = this._blendOperation.value;
                ctx.canvasRenderingContext.drawImage(this.ownContext!.canvas, 0, 0);
            });
        }
    }

    renderDebug(): void {
        if (this.visible) {
            this._layer.renderDebug();
        }
    }

    update() {
        this.needsUpdate = true;
    }

    protected onDelete(): void {
        this._layer.releaseReference(this);
        this._postEffect.releaseReference(this);
    }

    private checkViewportSize() {
        if (this.ownContext == undefined) {
            this.ownContext = RenderingContext2d.current.context.duplicate();
            this.needsUpdate = true;
        }
        const viewport = RenderingContext2d.current.viewport;
        if (this.ownContext.canvas.width !== viewport.width || this.ownContext.canvas.height !== viewport.height) {
            this.ownContext.canvas.width = viewport.width;
            this.ownContext.canvas.height = viewport.height;
            this.needsUpdate = true;
        }
    }

    private renderBackBuffer() {
        const camera = RenderingContext2d.current.camera;
        RenderingContext2d.renderFull(this.ownContext!, camera, this.filterStack, (ctx) => {
            ctx.clear();
            this._layer.preRender();
            this._layer.render();
            this._postEffect.render();
        });
    }

}