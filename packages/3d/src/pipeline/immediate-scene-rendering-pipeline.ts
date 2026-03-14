import { AbstractReferencedObject } from "@pluto/core";
import { Scene3d } from "../scene/scene-3d";
import { SceneRenderingPipeline } from "./scene-rendering-pipeline";

export class ImmediateSceneRenderingPipeline extends AbstractReferencedObject implements SceneRenderingPipeline {

    render(scene: Scene3d): void {
        scene.renderImmediate();
    }

    protected override onDelete(): void { }
}