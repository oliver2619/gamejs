import { AbstractReferencedObject } from "@pluto/core";
import { Error3d } from "../error-3d";

export class VertexBuffer extends AbstractReferencedObject {

    private readonly gl: WebGLRenderingContext;
    private readonly buffer: WebGLBuffer;

    constructor(data: {
        gl: WebGLRenderingContext,
        vertices: BufferSource,
        modifiable?: boolean | undefined,
    }) {
        super();
        this.gl = data.gl;
        this.buffer = Error3d.execute(() => this.gl.createBuffer(), this.gl, () => 'Failed to create vertex buffer.');
        try {
            this.init(data.vertices, data.modifiable ?? false);
        } catch (e) {
            this.gl.deleteBuffer(this.buffer);
            throw e;
        }
    }

    use(callback: () => void) {
        this.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.buffer);
        try {
            callback();
        } finally {
            this.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, null);
        }
    }

    private init(vertices: BufferSource, modifiable: boolean) {
        this.use(() => {
            Error3d.execute(() => this.gl.bufferData(WebGLRenderingContext.ARRAY_BUFFER, vertices, modifiable ? WebGLRenderingContext.DYNAMIC_DRAW : WebGLRenderingContext.STATIC_DRAW), this.gl, () => 'Failed to set vertex buffer data.');
        });
    }

    protected onDelete(): void {
        this.gl.deleteBuffer(this.buffer);
    }
}