import { Point2d, Rect2d, ReferencedObject, ReferencedObjects } from "@ge/common";
import { Context3d } from "../context/context-3d";
import { Scene3d } from "../scene/scene-3d";
import { Camera3d } from "../scene/camera/camera-3d";
import { SceneRenderingPipeline } from "../pipeline/scene-rendering-pipeline";
import { RenderingContext3d } from "../context/rendering-context-3d";
import { ImmediateSceneRenderingPipeline } from "../pipeline/immediate-scene-rendering-pipeline";

const defaultMapping = (size: Point2d) => {
    return new Rect2d(0, 0, size.x, size.y);
}

export class Viewport3d implements ReferencedObject {

    camera: Camera3d;
    mapping: (size: Point2d) => Rect2d;
    pipeline: SceneRenderingPipeline;

    private readonly referencedObject = ReferencedObjects.create(() => this.onDestroy());
    private _scene: Scene3d;
    private rect = new Rect2d(0, 0, 0, 0);

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

    constructor(data: { scene: Scene3d, camera: Camera3d, pipeline?: SceneRenderingPipeline, mapping?: (size: Point2d) => Rect2d }) {
        this._scene = data.scene;
        this._scene.addReference(this);
        this.camera = data.camera;
        this.pipeline = data.pipeline ?? new ImmediateSceneRenderingPipeline();
        this.mapping = data.mapping ?? defaultMapping;
    }

    addReference(owner: any): void {
        this.referencedObject.addReference(owner);
    }

    releaseReference(owner: any): void {
        this.referencedObject.releaseReference(owner);
    }

    render() {
        const ctx = Context3d.current;
        this.rect.set(0, 0, ctx.canvasSize.x, ctx.canvasSize.y);
        this.rect.intersect(this.mapping(ctx.canvasSize));
        if (!this.rect.isEmpty) {
            RenderingContext3d.render(this.rect, this.camera, () => this.pipeline.render(this._scene));
        }
    }

    setDefaultMapping() {
        this.mapping = defaultMapping;
    }

    private onDestroy() {
        this._scene.releaseReference(this);
    }
}