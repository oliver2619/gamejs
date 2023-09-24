import { Component, ComponentData } from 'core/src/Component';
import { Scene2D } from './scene/scene2d';

export class Component2D extends Component {

    protected readonly maxViewportSize = undefined;

    private _scene: Scene2D | undefined;

    get scene(): Scene2D | undefined {
        return this._scene;
    }

    set scene(s: Scene2D | undefined) {
        this._scene?.releaseReference(this);
        this._scene = s;
        this._scene?.addReference(this);
    }

    private constructor(canvas: HTMLCanvasElement, data: ComponentData, private readonly context: CanvasRenderingContext2D) {
        super(canvas, data);
    }

    static attach(canvas: HTMLCanvasElement, data: ComponentData): Component2D {
        const context = canvas.getContext('2d', {
            alpha: true
        });
        if (context == null) {
            throw new Error('Failed to create 2d rendering context');
        }
        return new Component2D(canvas, data, context);
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
        this._scene?.render(this.context);
    }
}