import { Animation } from "./animation/animation";
import { AnimationSet } from "./animation/animation-set";
import { Timer } from "./animation/timer";
import { InputSet } from "./input/input-set";
import { ReadonlyVector2, Vector2 } from "./math/vector2";
import { GarbageCollector } from "./reference/garbage-collector";

export interface ComponentData {
    readonly fps?: number;
    readonly rate?: number;
    readonly canvasToViewport?: (canvasSize: ReadonlyVector2) => ReadonlyVector2;
}

export abstract class Component {

    private readonly timer;
    private readonly animationSet = new AnimationSet();
    private readonly canvasToViewport: (canvasSize: ReadonlyVector2) => ReadonlyVector2;
    protected readonly canvasSize = new Vector2(0, 0);
    protected readonly viewportSize = new Vector2(0, 0);

    private _inputSet: InputSet | undefined;

    get fps(): number {
        return this.timer.fps;
    }

    get isRenderLoop(): boolean {
        return this.timer.active;
    }

    get rate(): number {
        return this.timer.rate;
    }

    set rate(r: number) {
        this.timer.rate = r;
    }

    protected constructor(public readonly canvas: HTMLCanvasElement, data: ComponentData) {
        this.timer = new Timer({
            fps: data.fps,
            rate: data.rate
        });
        this.timer.onTimer.subscribe(timeout => this.processTimer(timeout));
        this.canvasToViewport = data.canvasToViewport == undefined ? sz => sz : data.canvasToViewport;
    }

    addAnimation(animation: Animation) {
        this.animationSet.addAnimation(animation);
    }

    dispose() {
        this.timer.active = false;
        this._inputSet?.setEnabledBy(this, false);
        this.onDispose();
        GarbageCollector.processAll();
    }

    render() {
        if (this.canRender()) {
            this.onRender();
        }
    }

    setFixedFps(fps: number | undefined) {
        this.timer.setFixedFps(fps);
    }

    setInputSet(inputSet: InputSet | undefined) {
        this._inputSet?.setEnabledBy(this, false);
        this._inputSet = inputSet;
        this._inputSet?.setEnabledBy(this, true);
    }

    startRenderLoop() {
        this.timer.active = true;
    }

    stopRenderLoop() {
        this.timer.active = false;
    }

    protected abstract readonly maxViewportSize: number | undefined;

    protected abstract readonly hasContentToRender: boolean;

    protected abstract onChangeViewportSize(): void;

    protected abstract onDispose(): void;

    protected abstract onRender(): void;

    private canRender(): boolean {
        if (!this.hasContentToRender) {
            return false;
        }
        this.adjustViewportSize();
        return this.isViewportVisible();
    }

    private isViewportVisible(): boolean {
        return this.viewportSize.x > 0 && this.viewportSize.y > 0 && this.canvasSize.x > 0 && this.canvasSize.y > 0;
    }

    private adjustViewportSize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        if (w !== this.canvasSize.x || h !== this.canvasSize.y) {
            this.canvasSize.x = w;
            this.canvasSize.y = h;
            const s = this.canvasToViewport(this.canvasSize);
            const max = this.maxViewportSize;
            const vx = (max == undefined ? s.x : Math.min(s.x, max)) | 0;
            const vy = (max == undefined ? s.y : Math.min(s.y, max)) | 0;
            if (this.viewportSize.x !== vx || this.viewportSize.y !== vy) {
                this.viewportSize.x = vx;
                this.viewportSize.y = vy;
                this.canvas.width = vx;
                this.canvas.height = vy;
                if (this.isViewportVisible()) {
                    this.onChangeViewportSize();
                }
            }
        }
    }

    private processTimer(timeout: number) {
        if (this.canRender()) {
            this._inputSet?.checkState();
            this.animationSet.animate(timeout);
            this.onRender();
        }
        GarbageCollector.processOne();
    }
}