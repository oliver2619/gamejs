import { ReferencedObject, ReferencedObjects } from "@ge/common";
import { Context3d } from "../context";
import { Error3d } from "../error-3d";

export abstract class Shader implements ReferencedObject {

    readonly shader: WebGLShader;
    private readonly referencedObject = ReferencedObjects.create(() => this.onDelete());

    protected constructor(protected readonly context: Context3d, type: GLenum, source: string) {
        const shader = context.gl.createShader(type);
        if (shader == null) {
            Error3d.throwError('Failed to create shader.', context.gl);
        }
        this.shader = shader;
        context.gl.shaderSource(shader, source);
        context.gl.compileShader(shader);
        const status = context.gl.getShaderParameter(shader, WebGLRenderingContext.COMPILE_STATUS);
        if(!status) {
            const info = context.gl.getShaderInfoLog(shader);
            if(info != null) {
                console.error(info);
            }
            console.error(source);
            Error3d.throwError('Failed to compile shader.', context.gl);
        }
    }

    addReference(owner: any): void {
        this.referencedObject.addReference(owner);
    }

    releaseReference(owner: any): void {
        this.referencedObject.releaseReference(owner);
    }

    private onDelete() {
        this.context.gl.deleteShader(this.shader);
    }
}