import { ReferencedObject, ReferencedObjects, Timer } from "@ge/common";
import { Context3d } from "../context/context-3d";
import { Viewport3d } from "./viewport-3d";

class Context3dImpl extends Context3d {

    constructor(gl: WebGL2RenderingContext, antialias: boolean) {
        super(gl, antialias);
    }

    destroy() {
        this.onDestroy();
    }
}

export interface Component3dSettings {
    // TODO antialiasFactor (samples = 1, 2, 4, ..., max)
    antialias?: boolean,
    autoRender?: boolean,
    fps?: number | undefined,
}

export class Component3d implements ReferencedObject {

    private readonly viewports: Viewport3d[] = [];
    private readonly timer: Timer;
    private readonly referencedObject = ReferencedObjects.create(() => this.onDestroy());
    private readonly onContextLost = () => {
        console.error('Fatal error: WebGL2RenderingContext lost.');
        this.viewports.splice(0, this.viewports.length);
        // TODO what happens to objects already transferred to the garbage collector?
        this.updateTimer();
    };

    private _autoRender: boolean;
    private _context: Context3dImpl | undefined;

    get autoRender(): boolean {
        return this._autoRender;
    }

    set autoRender(a: boolean) {
        if (this._autoRender != a) {
            this.timer.enabled = a;
            this.updateTimer();
        }
    }

    get context(): Context3d {
        if (this._context == undefined) {
            throw new Error('Context has not been created or has been lost.');
        }
        return this._context;
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

    private constructor(readonly element: HTMLCanvasElement, context: Context3dImpl, fps: number | undefined, autoRender: boolean) {
        this._context = context;
        this._autoRender = autoRender;
        this.timer = new Timer({ fps, disabled: true });
        this.timer.onTimer.subscribe(this, () => this.render());
        element.addEventListener('webglcontextlost', this.onContextLost);
    }

    static create(element: HTMLCanvasElement, settings?: Component3dSettings): Component3d {
        const antialias = settings?.antialias ?? false;
        const context2 = this.createContext(element, antialias);
        return new Component3d(element, new Context3dImpl(context2, antialias), settings?.fps, settings?.autoRender ?? false);
    }

    addReference(owner: any): void {
        this.referencedObject.addReference(owner);
    }

    addViewport(viewport: Viewport3d) {
        this.viewports.push(viewport);
        viewport.addReference(this);
        this.updateTimer();
    }

    clearViewports() {
        this.viewports.forEach(it => it.releaseReference(this));
        this.viewports.splice(0, this.viewports.length);
        this.updateTimer();
    }

    releaseReference(owner: any): void {
        this.referencedObject.releaseReference(owner);
    }

    removeViewport(viewport: Viewport3d) {
        const i = this.viewports.indexOf(viewport);
        if (i >= 0) {
            this.viewports.splice(i, 1);
            viewport.releaseReference(this);
            this.updateTimer();
        }
    }

    render() {
        ReferencedObjects.deleteSomeUnreferenced(0.25);
        if (this._context != undefined) {
            this._context.render(() => {
                this.viewports.forEach(v => v.render());
            });
        }
    }

    private static createContext(element: HTMLCanvasElement, antialias: boolean): WebGL2RenderingContext {
        const context2 = element.getContext('webgl2', {
            alpha: false,
            antialias,
            depth: true,
            desynchronized: false,
            failIfMajorPerformanceCaveat: false,
            powerPreference: 'high-performance',
            premultipliedAlpha: false,
            preserveDrawingBuffer: true,
            stencil: true
        });
        if (context2 == null) {
            throw new Error('Failed to create WebGL2RenderingContext.');
        }
        return context2;
    }

    private onDestroy() {
        this.element.removeEventListener('webglcontextlost', this.onContextLost);
        this.timer.onTimer.unsubscribe(this);
        this.viewports.forEach(it => it.releaseReference(this));
        this.viewports.splice(0, this.viewports.length);
        ReferencedObjects.deleteAllUnreferenced();
        if (this._context != undefined) {
            this._context.destroy();
            this._context = undefined;
        }
    }

    private updateTimer() {
        this.timer.enabled = this._autoRender && this.viewports.length > 0;
    }
}
