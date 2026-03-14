import { AbstractReferencedObject } from "@pluto/core";
import { Context3d } from "../context";
import { Error3d } from "../error-3d";
import { ShaderPrecision } from "./shader-precision";

const VERSION = '300';

export abstract class Shader extends AbstractReferencedObject {

    readonly shader: WebGLShader;
    protected readonly context: Context3d;

    protected constructor(type: GLenum, data: {
        context: Context3d,
        source: string,
        floatPrecision?: ShaderPrecision,
        precision?: ShaderPrecision,
    }) {
        super();
        this.context = data.context;
        const shader = this.context.gl.createShader(type);
        if (shader == null) {
            Error3d.throwError(this.context.gl, 'Failed to create shader.');
        }
        this.shader = shader;
        try {
            this.create(data.source, this.context.gl, data.precision ?? this.context.shaderPrecision, data.floatPrecision ?? this.context.shaderPrecision);
        } catch (e) {
            this.context.gl.deleteShader(this.shader);
            throw e;
        }
    }

    private create(source: string, gl: WebGL2RenderingContext, precision: ShaderPrecision, floatPrecision: ShaderPrecision) {
        const code = this.createFinalCode(source, precision, floatPrecision);
        gl.shaderSource(this.shader, code);
        gl.compileShader(this.shader);
        const status = gl.getShaderParameter(this.shader, WebGLRenderingContext.COMPILE_STATUS);
        if (!status) {
            const info = gl.getShaderInfoLog(this.shader);
            if (info != null) {
                console.error(info);
            }
            console.error(code.split('\n').map((l, i) => `${i + 1}: ${l}`).join('\n'));
            Error3d.throwError(gl, 'Failed to compile shader.');
        }
    }

    private createFinalCode(code: string, precision: ShaderPrecision, floatPrecision: ShaderPrecision): string {
        const header = `#version ${VERSION} es`;
        const precisions = ['int', 'sampler2D', 'samplerCube', 'isampler2D', 'usampler2D'].map(t => `precision ${precision} ${t};`).join('\n');
        const floatPrec = `precision ${floatPrecision} float;`;
        return `${header}\n${precisions}\n${floatPrec}\n${code}`;
    }

    protected override onDelete(): void {
        this.context.gl.deleteShader(this.shader);
    }
}