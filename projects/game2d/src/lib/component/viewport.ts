import { GarbageCollectibleObject, ReadonlyVector2, Rectangle, ReferencedObject } from "projects/core/src/public-api";
import { RenderingContext2d } from "../render/rendering-context2d";
import { Camera2 } from "../scene/camera2";
import { Scene2d } from "../scene/scene2d";

export type ComponentViewportFunction = (componentSize: ReadonlyVector2) => Rectangle;

export interface ComponentViewportData {

    readonly scene: Scene2d;
    readonly camera: Camera2;
    readonly viewportFunction?: ComponentViewportFunction;
}

export class ComponentViewport implements ReferencedObject {

    active = true;
    viewportFunction: ComponentViewportFunction;
    camera: Camera2;

    private readonly rectangle = new Rectangle(0, 0, 0, 0);
    private readonly reference = new GarbageCollectibleObject(() => this.onDispose());
    private _scene: Scene2d;

    get hasReferences(): boolean {
        return this.reference.hasReferences;
    }

    get scene(): Scene2d {
        return this._scene;
    }

    set scene(s: Scene2d) {
        if (this._scene !== s) {
            this._scene.releaseReference(this);
            this._scene = s;
            this._scene.addReference(this);
        }
    }

    constructor(data: ComponentViewportData) {
        this.viewportFunction = data.viewportFunction == undefined ? componentSize => new Rectangle(0, 0, componentSize.x, componentSize.y) : data.viewportFunction;
        this.camera = data.camera;
        this._scene = data.scene;
        this._scene.addReference(this);
    }

    addReference(holder: any) {
        this.reference.addReference(holder);
    }

    releaseReference(holder: any) {
        this.reference.releaseReference(holder);
    }

    preRender(context: RenderingContext2d) {
        const newRect = this.active ? this.viewportFunction(context.viewportSize) : new Rectangle(0, 0, 0, 0);
        if (!newRect.equals(this.rectangle)) {
            if (!this.rectangle.isEmpty) {
                context.context.clearRect(this.rectangle.x1, this.rectangle.y1, this.rectangle.width, this.rectangle.height);
            }
            this.rectangle.setRectangle(newRect);
        }
    }

    render(context: RenderingContext2d) {
        if (this.active) {
            context.renderAtViewport(this.rectangle, ctx => {
                this._scene.render(ctx, this.camera);
            });
        }
    }

    private onDispose() {
        this._scene.releaseReference(this);
    }
}