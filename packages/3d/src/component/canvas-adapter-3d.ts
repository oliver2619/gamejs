import { CanvasAdapterData, ReferencedObjects } from "@pluto/core";
import { Context3d, Context3dInitData } from "../context/context-3d";
import { Viewport3d } from "./viewport-3d";
import { CanvasAdapter } from "@pluto/core";
import { ShaderPrecision } from "../shader";

class Context3dImpl extends Context3d {

    constructor(gl: WebGL2RenderingContext, data: Context3dInitData) {
        super(gl, data);
    }

    destroy() {
        this.onDestroy();
    }

    resize() {
        this.onResize();
    }
}

export interface CanvasAdapter3dSettings extends CanvasAdapterData {
    // TODO antialiasFactor (samples = 1, 2, 4, ..., max)
    antialias?: boolean,
    autoRender?: boolean,
    shaderPrecision?: ShaderPrecision,
}

export class CanvasAdapter3d extends CanvasAdapter {

    private readonly viewports: Viewport3d[] = [];

    private _context: Context3dImpl | undefined;

    get context(): Context3d {
        if (this._context == undefined) {
            throw new Error('Context has not been created or has been lost.');
        }
        return this._context;
    }

    private constructor(settings: CanvasAdapter3dSettings, context: Context3dImpl) {
        super(settings);
        this._context = context;
        this.canvas.addEventListener('webglcontextlost', this.onContextLost);
    }

    static create(settings: CanvasAdapter3dSettings): CanvasAdapter3d {
        const antialias = settings?.antialias ?? false;
        const context2 = this.createContext(settings.canvas, antialias);
        return new CanvasAdapter3d(settings, new Context3dImpl(context2, {
            antialias: antialias,
            shaderPrecision: settings.shaderPrecision ?? 'mediump',
        }));
    }

    addViewport(viewport: Viewport3d) {
        this.viewports.push(viewport);
        viewport.addReference(this);
    }

    clearViewports() {
        this.viewports.forEach(it => it.releaseReference(this));
        this.viewports.splice(0, this.viewports.length);
    }

    removeViewport(viewport: Viewport3d) {
        const i = this.viewports.indexOf(viewport);
        if (i < 0) {
            throw new RangeError('Viewport not found in canvas adapter.');
        }
        this.viewports.splice(i, 1);
        viewport.releaseReference(this);
    }

    protected onDestroy() {
        this.canvas.removeEventListener('webglcontextlost', this.onContextLost);
        this.viewports.forEach(it => it.releaseReference(this));
        this.viewports.splice(0, this.viewports.length);
        ReferencedObjects.deleteAllUnreferenced();
        if (this._context != undefined) {
            this._context.destroy();
            this._context = undefined;
        }
    }

    protected onRender() {
        ReferencedObjects.deleteSomeUnreferenced(0.25);
        if (this._context != undefined) {
            let modified = false;
            const canvasSize = this._context.canvasSize;
            this.viewports.forEach(it => {
                if (it.recalcViewportRect(canvasSize)) {
                    modified = true;
                }
            });
            if (modified) {
                this._context.clear();
            }
            this._context.render(() => {
                this.viewports.forEach(v => {
                    v.render();
                });
            });
        }
    }

    protected override onResize(): void {
        if(this._context != undefined) {
            this._context.resize();
        }
        // TODO clear other caches?
        ReferencedObjects.deleteAllUnreferenced();
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

    private onContextLost() {
        console.error('Fatal error: WebGL2RenderingContext lost.');
        this.viewports.splice(0, this.viewports.length);
        // TODO what happens to objects already transferred to the garbage collector?
    };
}
