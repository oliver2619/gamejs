import { Context3d } from "../context/context-3d";
import { Shader } from "./shader";
import { ShaderPrecision } from "./shader-precision";

export class VertexShader extends Shader {

    constructor(data: {
        context: Context3d,
        source: string,
        floatPrecision?: ShaderPrecision,
        precision?: ShaderPrecision,
    }) {
        super(WebGLRenderingContext.VERTEX_SHADER, data);
    }

}