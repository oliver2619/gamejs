import { AbstractReferencedObject } from "@pluto/core";
import { MeshMode } from "./mesh-mode";
import { Error3d } from "../error-3d";

export class IndexBuffer extends AbstractReferencedObject {

    private readonly gl: WebGLRenderingContext;
    private readonly buffer: WebGLBuffer;

    constructor(data: {
        gl: WebGLRenderingContext,
        indices: Int16Array,
    }) {
        super();
        this.gl = data.gl;
        this.buffer = Error3d.execute(() => this.gl.createBuffer(), this.gl, () => 'Failed to create index buffer.');
        try {
            this.init(data.indices);
        } catch (e) {
            this.gl.deleteBuffer(this.buffer);
            throw e;
        }
    }

    begin() {
        this.gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, this.buffer);
    }

    end() {
        this.gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, null);
    }

    renderRange(meshMode: MeshMode, startIndex: number, indexCount: number) {
        this.gl.drawElements(meshMode, indexCount, WebGLRenderingContext.UNSIGNED_SHORT, startIndex * 2)
    }

    private update(callback: () => void) {
        this.gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, this.buffer);
        try {
            callback();
        } finally {
            this.gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, null);
        }
    }

    private init(indices: Int16Array) {
        this.update(() => {
            Error3d.execute(() => {
                this.gl.bufferData(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, indices, WebGLRenderingContext.STATIC_DRAW);
            }, this.gl, () => 'Failed to set index buffer data.');
        });
    }

    protected onDelete(): void {
        this.gl.deleteBuffer(this.buffer);
    }
}