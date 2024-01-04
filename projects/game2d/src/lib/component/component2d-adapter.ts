import { ComponentAdapter, ComponentAdapterData } from "core";
import { RenderingContext2d, RenderingContext2dData } from "../render/rendering-context2d";
import { ComponentViewport } from './viewport';

export interface Component2dAdapterData extends ComponentAdapterData, RenderingContext2dData {
    readonly alpha?: boolean;
}

export class Component2dAdapter extends ComponentAdapter {

    protected readonly maxViewportSize = undefined;

    private readonly context: RenderingContext2d;
    private readonly viewports: ComponentViewport[] = [];

    private constructor(canvas: HTMLCanvasElement, data: Component2dAdapterData, context: CanvasRenderingContext2D) {
        super(canvas, data);
        this.context = new RenderingContext2d(context, data);
    }

    static attach(canvas: HTMLCanvasElement, data: Component2dAdapterData): Component2dAdapter {
        const context = canvas.getContext('2d', {
            alpha: data.alpha == undefined ? false : data.alpha,
            willReadFrequently: false
        });
        if (context == null) {
            throw new Error('Failed to create 2d rendering context');
        }
        return new Component2dAdapter(canvas, data, context);
    }

    addViewport(viewport: ComponentViewport) {
        this.viewports.push(viewport);
        viewport.addReference(this);
    }

    removeViewport(viewport: ComponentViewport) {
        const found = this.viewports.indexOf(viewport);
        if (found >= 0) {
            this.viewports.splice(found, 1);
            viewport.releaseReference(this);
        }
    }

    protected get hasContentToRender(): boolean {
        return this.viewports.length > 0;
    }

    protected onChangeViewportSize() {
    }

    protected onDispose() {
        this.viewports.forEach(it => it.releaseReference(this));
        this.viewports.splice(0, this.viewports.length);
    }

    protected onRender() {
        this.context.renderFullSized(ctx => {
            this.viewports.forEach(it => it.preRender(ctx));
            this.viewports.forEach(it => it.render(ctx));
        });
    }
}