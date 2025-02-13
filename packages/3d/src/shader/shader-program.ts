import { ReferencedObject, ReferencedObjects } from "@ge/common";
import { Context3d } from "../context";
import { Shader } from "./shader";
import { Error3d } from "../error-3d";

export class ShaderProgram implements ReferencedObject {

    private readonly referencedObject = ReferencedObjects.create(() => this.onDelete());
    private readonly program: WebGLProgram;
    private readonly shaders: Shader[];

    constructor(private readonly context: Context3d, shaders: Shader[]) {
        this.shaders = shaders.slice(0);
        this.program = context.gl.createProgram();
        shaders.forEach(it => {
            it.addReference(this);
            context.gl.attachShader(this.program, it.shader);
        });
        context.gl.linkProgram(this.program);
        const status = context.gl.getProgramParameter(this.program, WebGLRenderingContext.LINK_STATUS);
        if (!status) {
            const info = context.gl.getProgramInfoLog(this.program);
            if (info != null) {
                console.error(info);
            }
            Error3d.throwError('Failed to create program', context.gl);
        }
    }

    addReference(owner: any): void {
        this.referencedObject.addReference(owner);
    }

    bindAttribLocation(index: GLuint, name: string) {
        this.context.gl.bindAttribLocation(this.program, index, name);
    }

    releaseReference(owner: any): void {
        this.referencedObject.releaseReference(owner);
    }

    use() {
        this.context.gl.useProgram(this.program);
    }

    private onDelete() {
        this.shaders.forEach(it => {
            this.context.gl.detachShader(this.program, it.shader);
            it.releaseReference(this);
        });
        this.context.gl.deleteProgram(this.program);
    }

}