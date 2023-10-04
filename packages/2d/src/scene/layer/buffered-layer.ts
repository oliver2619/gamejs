import { RenderingContext2d } from "../../render/rendering-context2d";
import { Camera2 } from "../camera2";
import { Layer } from "./layer";
import { Filter } from "../../render/filter";
import { CompositeOperation } from "../../render/composite-operation";
import { PostEffect } from '../../scene/post-effect/post-effect';
import { EmptyPostEffect } from '../../scene/post-effect/empty-post-effect';

export interface BufferedLayerData {

    readonly layer: Layer;
    readonly autoUpdate: boolean;
    readonly alpha?: number;
    readonly compositeOperation?: CompositeOperation;
    readonly postEffect?: PostEffect;
}

export class BufferedLayer extends Layer {

    alpha: number;
    autoUpdate: boolean;
    filter = new Filter();

    private _layer: Layer;
    private _compositeOperation: CompositeOperation;
    private _postEffect: PostEffect;
    private ownContext: RenderingContext2d | undefined;
    private needsUpdate = false;

    get compositeOperation(): CompositeOperation {
        return this._compositeOperation;
    }

    set compositeOperation(o: CompositeOperation) {
        if (this._compositeOperation !== o) {
            this._compositeOperation = o;
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
        super();
        this._layer = data.layer;
        this.alpha = data.alpha == undefined ? 1 : data.alpha;
        this.autoUpdate = data.autoUpdate;
        this._compositeOperation = data.compositeOperation == undefined ? CompositeOperation.NORMAL : data.compositeOperation;
        this._postEffect = data.postEffect == undefined ? EmptyPostEffect.INSTANCE : data.postEffect;
        this._layer.addReference(this);
        this._postEffect.addReference(this);
    }

    getAlpha(x: number, y: number, defaultAlpha: number): number {
        return this.ownContext?.getAlpha(x, y, defaultAlpha) ?? defaultAlpha;
    }

    preRender(context: RenderingContext2d, globalCamera: Camera2): void {
        if (!this.visible) {
            return;
        }
        this.checkViewportSize(context);
        if (this.autoUpdate || this.needsUpdate) {
            this.renderBackBuffer(globalCamera);
            this.needsUpdate = false;
        }
    }

    render(context: RenderingContext2d) {
        if (!this.visible) {
            return;
        }
        context.withFilter(this.filter, ctx => {
            ctx.context.globalAlpha *= this.alpha;
            ctx.context.globalCompositeOperation = this._compositeOperation.value;
            ctx.context.drawImage(this.ownContext!.context.canvas, 0, 0);
        });
    }

    update() {
        this.needsUpdate = true;
    }

    private checkViewportSize(context: RenderingContext2d) {
        if (this.ownContext == undefined) {
            this.ownContext = context.duplicateWithNewCanvas(true);
            this.needsUpdate = true;
        }
        if (this.ownContext.context.canvas.width !== context.viewportSize.x || this.ownContext.context.canvas.height !== context.viewportSize.y) {
            this.ownContext.context.canvas.width = context.viewportSize.x
            this.ownContext.context.canvas.height = context.viewportSize.y;
            this.needsUpdate = true;
        }
    }

    protected onDispose(): void {
        super.onDispose();
        this._layer.releaseReference(this);
    }

    private renderBackBuffer(globalCamera: Camera2) {
        this.ownContext!.renderFullSized(ctx => {
            ctx.clear();
            this._layer.preRender(ctx, globalCamera);
            this._layer.render(ctx);
            this._postEffect.render(ctx);
        });
    }
}