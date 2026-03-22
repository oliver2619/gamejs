import { Rectangle, Viewport, ReadonlyVector2d, EventObservable, Observable } from "@pluto/core";
import { Scene3d } from "../scene/scene-3d";
import { Camera3d } from "../scene/camera/camera-3d";
import { SceneRenderingPipeline } from "../pipeline/scene-rendering-pipeline";
import { ImmediateSceneRenderingPipeline } from "../pipeline/immediate-scene-rendering-pipeline";
import { RenderingContext3d } from "../context";

export class Viewport3d extends Viewport {

    camera: Camera3d;

    private _pipeline: SceneRenderingPipeline;
    private _scene: Scene3d;
    private _zIndex: number;
    private _onZIndexChange = new EventObservable<number>();

    get onZIndexChange(): Observable<number> {
        return this._onZIndexChange;
    }

    get pipeline(): SceneRenderingPipeline {
        return this._pipeline;
    }

    set pipeline(p: SceneRenderingPipeline) {
        if (this._pipeline !== p) {
            this._pipeline.releaseReference(this);
            this._pipeline = p;
            this._pipeline.addReference(this);
        }
    }

    get scene(): Scene3d {
        return this._scene;
    }

    set scene(scene: Scene3d) {
        if (this._scene !== scene) {
            this._scene.releaseReference(this);
            this._scene = scene;
            this._scene.addReference(this);
        }
    }

    get zIndex(): number {
        return this._zIndex;
    }

    set zIndex(z: number) {
        if (this._zIndex !== z) {
            this._zIndex = z;
            this._onZIndexChange.next(z);
        }
    }

    constructor(data: { scene: Scene3d, camera: Camera3d, pipeline?: SceneRenderingPipeline, mapping?: (size: ReadonlyVector2d) => Rectangle, zIndex?: number }) {
        super(data.mapping);
        this._scene = data.scene;
        this._scene.addReference(this);
        this.camera = data.camera;
        this._pipeline = data.pipeline ?? new ImmediateSceneRenderingPipeline();
        this._pipeline.addReference(this);
        this._zIndex = data.zIndex ?? 0;
    }

    render() {
        const rt = this.rectangle;
        if (!rt.isEmpty) {
            RenderingContext3d.render(rt, this.camera, () => this._pipeline.render(this._scene));
        }
    }

    protected override onDelete(): void {
        this._scene.releaseReference(this);
        this._pipeline.releaseReference(this);
    }
}