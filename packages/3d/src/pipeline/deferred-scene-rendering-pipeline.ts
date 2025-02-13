import { SceneRenderingPipeline } from ".";
import { Scene3d } from "../scene";

export class DeferredSceneRenderingPipeline implements SceneRenderingPipeline {

    render(scene: Scene3d): void {
        // TODO implement
        scene.renderImmediate();
    }
}