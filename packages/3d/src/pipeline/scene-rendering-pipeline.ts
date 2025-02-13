import { Scene3d } from "../scene/scene-3d";

export interface SceneRenderingPipeline {

    render(scene: Scene3d): void;
}

// deferred:
//   render into color, normal, material textures
//   render lights using shadows into target
//   render transparency into target

// dof:
// render range 1 into texture
// ...
// render range n using texture from range n-1 into target
// render lensflare fx

// hdr & glow:
// render default into texture
// render texture and highlights to target using color mappping
