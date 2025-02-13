import { Scene3d } from "../scene/scene-3d";
import { SceneRenderingPipeline } from "./scene-rendering-pipeline";

export class ImmediateSceneRenderingPipeline implements SceneRenderingPipeline {

    render(scene: Scene3d): void {
        scene.renderImmediate();
    }
}