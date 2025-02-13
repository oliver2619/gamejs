import { Context3d } from "../context/context-3d";
import { Shader } from "./shader";

export class FragmentShader extends Shader {

    constructor(context: Context3d, source: string) {
        super(context, WebGLRenderingContext.FRAGMENT_SHADER, source);
    }
}