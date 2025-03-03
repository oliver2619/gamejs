import { Animation, AnimationBuilder } from "../animation";
import { ReferencedObject, ReferencedObjects } from "../reference";
import { Timer } from "../timer";

export interface CanvasAdapterData {
    canvas: HTMLCanvasElement;
    fps?: number | undefined;
    fullscreen?: boolean;
    alignTo?: HTMLElement;
}

export abstract class CanvasAdapter implements ReferencedObject {

    readonly canvas: HTMLCanvasElement;

    private readonly timer: Timer;
    private readonly animations = AnimationBuilder.parallel().build();
    private readonly referencedObject = ReferencedObjects.create(() => this.onReleasedLastReference());
    private readonly resizeObserverAlignedElement: ResizeObserver | undefined;
    private readonly resizeObserverCanvas = new ResizeObserver(() => this.onCanvasSizeChanged());

    private _fullscreen: boolean;

    get animationRate(): number {
        return this.timer.simulationRate;
    }

    set animationRate(r: number) {
        this.timer.simulationRate = r;
    }

    get currentFps(): number {
        return this.timer.currentFps;
    }

    get fps(): number | undefined {
        return this.timer.fps;
    }

    set fps(fps: number | undefined) {
        this.timer.fps = fps;
    }

    get fullscreen(): boolean {
        return this._fullscreen;
    }

    set fullscreen(f: boolean) {
        if (this._fullscreen !== f) {
            this._fullscreen = f;
            this.updateFullscreen();
        }
    }

    protected constructor(data: CanvasAdapterData) {
        this.canvas = data.canvas;
        this._fullscreen = data.fullscreen ?? false;
        this.timer = new Timer({ fps: data.fps, disabled: true });
        this.timer.onTimer.subscribe(this, timeout => {
            this.animations.animate(timeout, () => this.timer.enabled = false);
            this.render();
        });
        data.canvas.addEventListener('click', this.onClick, { capture: true });
        const alignedElement = data.alignTo;
        if (alignedElement != undefined) {
            this.resizeObserverAlignedElement = new ResizeObserver(() => this.alignCanvasToElement(alignedElement));
            this.resizeObserverAlignedElement.observe(alignedElement, { box: 'content-box' });
        }
        this.resizeObserverCanvas.observe(this.canvas, {box: 'content-box'});
    }

    addAnimation(animation: Animation) {
        this.animations.addAnimation(animation);
        this.timer.enabled = true;
    }

    addReference(owner: any): void {
        this.referencedObject.addReference(owner);
    }

    releaseReference(owner: any): void {
        this.referencedObject.releaseReference(owner);
    }

    render() {
        ReferencedObjects.deleteSomeUnreferenced(0.25);
        this.onRender();
    }

    protected abstract onDestroy(): void;
    protected abstract onRender(): void;
    protected abstract onResize(): void;

    private alignCanvasToElement(element: HTMLElement) {
        const rect = element.getBoundingClientRect();
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    private onCanvasSizeChanged() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        if(w !== this.canvas.width ||h !== this.canvas.height) {
            this.canvas.width = w;
            this.canvas.height = h;
            this.onResize();
        }
    }

    private onClick() {
        this.updateFullscreen();
    };

    private onReleasedLastReference() {
        this.timer.onTimer.unsubscribe(this);
        this.canvas.removeEventListener('click', this.onClick, { capture: true });
        this.resizeObserverCanvas.disconnect();
        if (this.resizeObserverAlignedElement != undefined) {
            this.resizeObserverAlignedElement.disconnect();
        }
        if (document.fullscreenElement === this.canvas) {
            document.exitFullscreen().then(() => { });
        }
        ReferencedObjects.deleteAllUnreferenced();
        this.onDestroy();
    }

    private updateFullscreen() {
        if (this._fullscreen && document.fullscreenElement !== this.canvas) {
            this.canvas.requestFullscreen({ navigationUI: 'hide' }).then(() => { });
        } else if (!this._fullscreen && document.fullscreenElement === this.canvas) {
            document.exitFullscreen().then(() => { });
        }
    }
}