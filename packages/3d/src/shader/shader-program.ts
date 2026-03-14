import { Context3d } from "../context";
import { Shader } from "./shader";
import { Error3d } from "../error-3d";
import { AbstractReferencedObject } from "@pluto/core";

export class ShaderProgram extends AbstractReferencedObject {

    private readonly program: WebGLProgram;
    private readonly shaders: Shader[];

    constructor(private readonly context: Context3d, shaders: Shader[]) {
        super();
        this.program = context.gl.createProgram();
        try {
            this.create(shaders, context.gl);
        } catch (e) {
            context.gl.deleteProgram(this.program);
            throw e;
        }
        this.shaders = shaders.slice(0);
        this.shaders.forEach(it => {
            it.addReference(this);
        });
    }

    bindAttribLocation(index: GLuint, name: string) {
        this.context.gl.bindAttribLocation(this.program, index, name);
    }

    use() {
        this.context.gl.useProgram(this.program);
    }

    private create(shaders: Shader[], gl: WebGL2RenderingContext) {
        shaders.forEach(it => {
            gl.attachShader(this.program, it.shader);
        });
        try {
            gl.linkProgram(this.program);
            const status = gl.getProgramParameter(this.program, WebGLRenderingContext.LINK_STATUS);
            if (!status) {
                const info = gl.getProgramInfoLog(this.program);
                if (info != null) {
                    console.error(info);
                }
                Error3d.throwError(gl, 'Failed to create program.');
            }
        } catch (e) {
            shaders.forEach(it => {
                gl.detachShader(this.program, it.shader);
            });
            throw e;
        }
    }

    protected onDelete() {
        this.shaders.forEach(it => {
            this.context.gl.detachShader(this.program, it.shader);
            it.releaseReference(this);
        });
        this.context.gl.deleteProgram(this.program);
    }

}