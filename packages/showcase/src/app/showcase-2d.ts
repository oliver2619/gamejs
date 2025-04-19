import { Camera2d, CanvasAdapter2d, LayeredScene, Viewport2d } from "@pluto/2d";
import { Animation, AnimationBuilder } from "@pluto/core";

export abstract class Showcase2d {

    protected readonly camera = new Camera2d();
    protected readonly scene = new LayeredScene({ debug: true });

    private adapter: CanvasAdapter2d | undefined;

    addAnimation(target: any, animation: Animation) {
        this.adapter?.addAnimation(target, animation);
    }

    init(adapter: CanvasAdapter2d): void {
        this.adapter = adapter;
        this.adapter.addViewport(new Viewport2d({
            camera: this.camera,
            scene: this.scene,
        }));
        this.onInit();
        this.adapter.addAnimation(this, AnimationBuilder.infinite().onAnimate(() => { }));
    }

    protected abstract onInit(): void;
}