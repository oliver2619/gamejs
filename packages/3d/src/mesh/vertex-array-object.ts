import { AbstractReferencedObject } from "@pluto/core";
import { VertexBuffer } from "./vertex-buffer";
import { Error3d } from "../error-3d";

export class VertexArrayObject extends AbstractReferencedObject {

    private readonly gl: WebGL2RenderingContext;
    private readonly vao: WebGLVertexArrayObject;

    constructor(data: {
        gl: WebGL2RenderingContext,
        vertexBuffer: VertexBuffer,
        init: (gl: WebGL2RenderingContext) => void,
    }) {
        super();
        this.gl = data.gl;
        this.vao = Error3d.execute(() => this.gl.createVertexArray(), this.gl, () => 'Failed to create vertex array object.');
        try {
            this.init(data.vertexBuffer, data.init);
        } catch (e) {
            this.gl.deleteVertexArray(this.vao);
            throw e;
        }
    }

    use(callback: () => void) {
        this.gl.bindVertexArray(this.vao);
        try {
            callback();
        } finally {
            this.gl.bindVertexArray(null);
        }
    }

    private init(vertexBuffer: VertexBuffer, init: (gl: WebGL2RenderingContext) => void) {
        this.use(() => {
            Error3d.execute(() => {
                vertexBuffer.use(() => init(this.gl));
            }, this.gl, () => 'Failed to set vertex array object data.');
        });
    }

    protected override onDelete(): void {
        this.gl.deleteVertexArray(this.vao);
    }
}