import { AbstractReferencedObject } from "@pluto/core";
import { SceneRenderingPipeline } from ".";
import { Scene3d } from "../scene";

export class DeferredSceneRenderingPipeline extends AbstractReferencedObject implements SceneRenderingPipeline {

    render(scene: Scene3d): void {
        // TODO implement
        scene.renderImmediate();
    }

    protected override onDelete(): void {
        // TODO implement
    }
}