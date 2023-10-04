import { Background } from "../background/background";
import { EmptyBackground } from "../background/empty-background";
import { RenderingContext2d } from "../../render/rendering-context2d";
import { Filter } from "../../render/filter";
import { Camera2 } from "../camera2";
import { PostEffect } from "../post-effect/post-effect";
import { EmptyPostEffect } from "../post-effect/empty-post-effect";
import { GarbageCollectibleObject } from 'core/src/index';
import { Layer } from './layer';

export class LayeredScene {

    filter = new Filter();

    private readonly reference = new GarbageCollectibleObject(() => this.onDispose());
    private layers: Layer[] = [];
    private _background: Background = EmptyBackground.INSTANCE;
    private _postEffect: PostEffect = EmptyPostEffect.INSTANCE;

    get postEffect(): PostEffect {
        return this._postEffect;
    }

    set postEffect(e: PostEffect) {
        if (this._postEffect !== e) {
            this._postEffect.releaseReference(this);
            this._postEffect = e;
            this._postEffect.addReference(this);
        }
    }

    get background(): Background {
        return this._background;
    }

    set background(b: Background) {
        if (this._background !== b) {
            this._background.releaseReference(this);
            this._background = b;
            this._background.addReference(this);
        }
    }

    get hasReferences(): boolean {
        return this.reference.hasReferences;
    }

    get numberOfLayers(): number {
        return this.layers.length;
    }

    constructor() {
        this._background.addReference(this);
        this._postEffect.addReference(this);
    }

    addLayer(layer: Layer) {
        this.layers.push(layer);
        layer.addReference(this);
    }

    addReference(holder: any) {
        this.reference.addReference(holder);
    }

    releaseReference(holder: any) {
        this.reference.releaseReference(holder);
    }

    removeLayer(layer: Layer) {
        const found = this.layers.indexOf(layer);
        if (found >= 0) {
            this.layers.splice(found, 1);
            layer.releaseReference(this);
        }
    }

    render(context: RenderingContext2d, camera: Camera2) {
        context.withFilter(this.filter, ctx => {
            this._background.render(ctx);
            this.layers.forEach(it => it.preRender(ctx, camera));
            this.layers.forEach(it => it.render(ctx));
        });
        this._postEffect.render(context);
    }

    setLayers(layers: Layer[]) {
        this.layers.forEach(it => it.releaseReference(this));
        this.layers = layers.slice(0);
        this.layers.forEach(it => it.addReference(this));
    }

    private onDispose() {
        this._background.releaseReference(this);
        this._postEffect.releaseReference(this);
        this.layers.forEach(it => it.releaseReference(this));
        this.layers = [];
    }
}