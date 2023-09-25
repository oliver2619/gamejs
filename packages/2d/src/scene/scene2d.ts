import {ReferencedObject, GarbageCollectibleObject} from 'core/src/index';
import {Scene2dLayer} from './scene2d-layer';
import {Background} from "./background/background";
import {EmptyBackground} from "./background/empty-background";
import {RenderingContext2d} from "../rendering-context2d";
import {Filter} from "../filter";
import {Camera2} from "./camera2";
import {PostEffect} from "./post-effect/post-effect";
import {PostEffectNone} from "./post-effect/post-effect-none";

export class Scene2d implements ReferencedObject {

    filter = new Filter();
    activeCamera: Camera2 = new Camera2({});

    private readonly reference = new GarbageCollectibleObject(() => this.onDispose());
    private readonly layers: Scene2dLayer[] = [];
    private _background: Background = EmptyBackground.INSTANCE;
    private _postEffect: PostEffect = PostEffectNone.INSTANCE;

    get postEffect(): PostEffect {
        return this._postEffect;
    }

    set postEffect(e: PostEffect) {

    }

    get background(): Background {
        return this._background;
    }

    set background(b: Background) {
        this._background.releaseReference(this);
        this._background = b;
        this._background.addReference(this);
    }

    get hasReferences(): boolean {
        return this.reference.hasReferences;
    }

    get numberOfLayers(): number {
        return this.layers.length;
    }

    constructor() {
        this._background.addReference(this);
    }

    addLayer(ownCanvas: boolean) {
        const layer = new Scene2dLayer(ownCanvas);
        this.layers.push(layer);
        layer.addReference(this);
    }

    addReference(holder: any) {
        this.reference.addReference(holder);
    }

    releaseReference(holder: any) {
        this.reference.releaseReference(holder);
    }

    render(context: RenderingContext2d) {
        context.withFilter(this.filter, ctx => {
            this._background.render(ctx);
            this.layers.forEach(it => it.render(ctx, this.activeCamera));
        });
        this._postEffect.render(context);
    }

    private onDispose() {
        this._background.releaseReference(this);
        this.layers.forEach(it => it.releaseReference(this));
    }
}