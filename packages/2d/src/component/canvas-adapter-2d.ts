import { CanvasAdapter, CanvasAdapterData, ReferencedObjects } from "@pluto/core";
import { Viewport2d } from "./viewport-2d";
import { Context2d } from "./context-2d";

export interface CanvasAdapter2dSettings extends CanvasAdapterData {
    alpha?: boolean;
    colorSpace?: PredefinedColorSpace;
    imageSmoothing?: ImageSmoothingQuality | undefined;
}

export class CanvasAdapter2d extends CanvasAdapter {

    private readonly viewports: Viewport2d[] = [];

    private constructor(settings: CanvasAdapter2dSettings, private readonly context: Context2d) {
        super(settings);
    }

    static create(settings: CanvasAdapter2dSettings): CanvasAdapter2d {
        const ctx = this.createContext(settings.canvas, settings.alpha ?? false, settings.colorSpace ?? 'srgb');
        return new CanvasAdapter2d(settings, new Context2d(ctx));
    }

    addViewport(viewport: Viewport2d) {
        this.viewports.push(viewport);
        viewport.addReference(this);
    }

    clearViewports() {
        this.viewports.forEach(it => it.releaseReference(this));
        this.viewports.splice(0, this.viewports.length);
    }

    removeViewport(viewport: Viewport2d) {
        const found = this.viewports.indexOf(viewport);
        if (found < 0) {
            throw new RangeError('Viewport not found in canvas adapter.');
        }
        this.viewports.splice(found, 1);
        viewport.releaseReference(this);
    }

    protected override onDestroy(): void {
        this.clearViewports();
        ReferencedObjects.deleteAllUnreferenced();
    }

    protected override onRender(): void {
        ReferencedObjects.deleteSomeUnreferenced(0.25);
        let modified = false;
        const canvasSize = this.context.size;
        this.viewports.forEach(it => {
            if (it.recalcViewportRect(canvasSize)) {
                modified = true;
            }
        });
        if (modified) {
            this.context.clear();
        }
        this.viewports.forEach(it => {
            it.render(this.context);
        });
    }

    protected override onResize(): void {
    }

    private static createContext(element: HTMLCanvasElement, alpha: boolean, colorSpace: PredefinedColorSpace): CanvasRenderingContext2D {
        const context = element.getContext('2d', {
            alpha,
            colorSpace
        });
        if (context == null) {
            throw new Error('Failed to create CanvasRenderingContext2D.');
        }
        return context;
    }
}