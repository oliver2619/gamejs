import { AbstractReferencedObject } from "@pluto/core";
import { Scene2d } from "./scene-2d";
import { Filter, FilterStack } from "../render/filter";
import { Layer } from "./layer/layer";
import { Background } from "./background/background";
import { EmptyBackground } from "./background/empty-background";
import { RenderingContext2d } from "../component/rendering-context-2d";
import { PostEffect } from "./post-effect";
import { EmptyPostEffect } from "./post-effect/empty-post-effect";

export class LayeredSceneData {
    debug?: boolean;
    filter?: Filter;
}

export class LayeredScene extends AbstractReferencedObject implements Scene2d {

    filter: Filter;
    debug: boolean;

    private _background: Background = new EmptyBackground();
    private layers: Layer[] = [];
    private _postEffect: PostEffect = new EmptyPostEffect();

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

    get numberOfLayers(): number {
        return this.layers.length;
    }

    get postEffect(): PostEffect {
        return this._postEffect;
    }

    set postEffect(p: PostEffect) {
        if (this._postEffect !== p) {
            this._postEffect.releaseReference(this);
            this._postEffect = p;
            this._postEffect.addReference(this);
        }
    }

    constructor(data?: Readonly<LayeredSceneData>) {
        super();
        this.filter = data?.filter == undefined ? FilterStack.createDefaultFilter() : { ...data.filter };
        this.debug = data?.debug ?? false;
        this._background.addReference(this);
        this._postEffect.addReference(this);
    }

    addLayer(layer: Layer) {
        this.layers.push(layer);
        layer.addReference(this);
    }

    clearLayers() {
        this.layers.forEach(it => it.releaseReference(this));
        this.layers = [];
    }

    removeLayer(layer: Layer) {
        const i = this.layers.indexOf(layer);
        if (i < 0) {
            throw new RangeError('Layer not found in scene.');
        }
        this.layers.splice(i, 1);
        layer.releaseReference(this);
    }

    render(): void {
        RenderingContext2d.withFilter(this.filter, () => {
            this._background.render();
            this.layers.forEach(it => it.preRender());
            this.layers.forEach(it => it.render());
        });
        this._postEffect.render();
        if (this.debug) {
            this.layers.forEach(it => it.renderDebug());
        }
    }

    setLayers(layers: Layer[]) {
        this.layers.forEach(it => it.releaseReference(this));
        this.layers = layers.slice(0);
        this.layers.forEach(it => it.addReference(this));
    }

    protected onDelete() {
        this._background.releaseReference(this);
        this.layers.forEach(it => it.releaseReference(this));
        this.layers = [];
        this._postEffect.releaseReference(this);
    }
}