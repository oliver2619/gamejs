import {Scene2d} from './scene/scene2d';
import {RenderingContext2d} from "./rendering-context2d";
import {Component, ComponentData} from "core/src/index";

export interface Component2dData extends ComponentData {
    readonly alpha?: boolean;
    readonly highQualityImageScaling?: boolean;
}

export class Component2d extends Component {

    protected readonly maxViewportSize = undefined;

    private readonly context: RenderingContext2d;
    private _scene: Scene2d | undefined;

    get scene(): Scene2d | undefined {
        return this._scene;
    }

    set scene(s: Scene2d | undefined) {
        if (this._scene !== s) {
            this._scene?.releaseReference(this);
            this._scene = s;
            this._scene?.addReference(this);
        }
    }

    private constructor(canvas: HTMLCanvasElement, data: Component2dData, context: CanvasRenderingContext2D) {
        super(canvas, data);
        this.context = new RenderingContext2d(context);
    }

    static attach(canvas: HTMLCanvasElement, data: Component2dData): Component2d {
        const context = canvas.getContext('2d', {
            alpha: data.alpha == undefined ? false : data.alpha
        });
        if (context == null) {
            throw new Error('Failed to create 2d rendering context');
        }
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = data.highQualityImageScaling == undefined ? 'low' : (data.highQualityImageScaling ? 'high' : 'low');
        return new Component2d(canvas, data, context);
    }

    protected get hasContentToRender(): boolean {
        return this._scene != undefined;
    }

    protected onChangeViewportSize() {
    }

    protected onDispose() {
        this.scene = undefined;
    }

    protected onRender() {
        this.context.renderFullSized(ctx => this._scene?.render(ctx));
    }
}