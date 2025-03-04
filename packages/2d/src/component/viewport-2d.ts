import { ReadonlyVector2d, Rectangle, Viewport } from "@pluto/core";
import { Scene2d } from "../scene/scene-2d";
import { Camera2d } from "../scene/camera-2d";
import { Context2d } from "./context-2d";
import { RenderingContext2d } from "./rendering-context-2d";
import { FilterStack } from "../render/filter";

export class Viewport2d extends Viewport {

    camera: Camera2d;
    filterStack: FilterStack;
    private _scene: Scene2d;

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

    constructor(data: { scene: Scene2d, camera: Camera2d, filterStack?: FilterStack, mapping?: (size: ReadonlyVector2d) => Rectangle }) {
        super(data.mapping);
        this.camera = data.camera;
        this.filterStack = data.filterStack ?? new FilterStack();
        this._scene = data.scene;
        this._scene.addReference(this);
    }

    render(context: Context2d) {
        const rt = this.rectangle;
        if (!rt.isEmpty) {
            RenderingContext2d.renderViewport(context, rt, this.camera, this.filterStack, () => {
                this._scene.render();
            });
        }
    }

    protected onDelete() {
        this._scene.releaseReference(this);
    }
}