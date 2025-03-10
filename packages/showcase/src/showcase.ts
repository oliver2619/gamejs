import { Camera2d, CanvasAdapter2d, LayeredScene, Viewport2d } from '@pluto/2d';
import { Animation, AnimationBuilder } from '@pluto/core';

export abstract class Showcase {

    create(parentElement: HTMLElement) {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 450;
        parentElement.appendChild(canvas);
        this.onCreate(canvas);
    }

    abstract destroy(): void;

    protected abstract onCreate(canvas: HTMLCanvasElement): void;
}

export type ShowcaseFactory = new () => Showcase;

export abstract class Showcase2d extends Showcase {

    protected readonly camera = new Camera2d();
    protected readonly scene = new LayeredScene({debug: true});

    private adapter: CanvasAdapter2d | undefined;

    addAnimation(target: any, animation: Animation) {
        this.adapter?.addAnimation(target, animation);
    }

    protected onCreate(canvas: HTMLCanvasElement): void {
        this.adapter = CanvasAdapter2d.create({ canvas, alpha: false, alignTo: canvas.parentElement!, imageSmoothing: 'high' });
        this.adapter.addViewport(new Viewport2d({
            camera: this.camera,
            scene: this.scene,
        }));
        this.onInit();
        this.adapter.addAnimation(this, AnimationBuilder.infinite().onAnimate(() => { }));
    }

    destroy(): void {
        this.adapter?.destroy();
        this.adapter = undefined;
    }

    protected abstract onInit(): void;
}