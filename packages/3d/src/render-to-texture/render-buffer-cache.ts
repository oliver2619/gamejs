import { ReadonlyVector2d } from "@pluto/core";
import { ColorRenderBuffer } from "./color-render-buffer";
import { DepthRenderBuffer } from "./depth-render-buffer";

class ColorRenderBufferStack {

    private stack: ColorRenderBuffer[] = [];
    private nextIndex = 0;

    constructor(private readonly size: ReadonlyVector2d, private readonly multisample: number, private readonly hdr: boolean) { }

    deleteAll(gl: WebGLRenderingContext): void {
        this.stack.forEach(b => b.delete(gl));
        // no need to clear array as stack is deleted too
    }

    next(callback: (buffer: ColorRenderBuffer) => void, gl: WebGLRenderingContext) {
        if (this.nextIndex >= this.stack.length) {
            this.stack.push(new ColorRenderBuffer({
                gl: gl,
                size: this.size,
                multisample: this.multisample,
                hdr: this.hdr
            }));
        }
        try {
            callback(this.stack[this.nextIndex++]!);
        } finally {
            --this.nextIndex;
        }
    }
}

class DepthRenderBufferStack {

    private readonly stack: DepthRenderBuffer[] = [];
    private nextIndex = 0;

    constructor(private readonly size: ReadonlyVector2d) { }

    deleteAll(gl: WebGLRenderingContext): void {
        this.stack.forEach(b => b.delete(gl));
        // no need to clear array as stack is deleted too
    }

    next(callback: (buffer: DepthRenderBuffer) => any, gl: WebGLRenderingContext): void {
        if (this.nextIndex >= this.stack.length) {
            this.stack.push(new DepthRenderBuffer({
                gl: gl,
                size: this.size
            }));
        }
        try {
            callback(this.stack[this.nextIndex++]!);
        } finally {
            --this.nextIndex;
        }
    }
}

export class RenderBufferCache {

    private readonly colorBuffers = new Map<number, Map<number, Map<string, ColorRenderBufferStack>>>();
    private readonly depthBuffers = new Map<number, Map<number, DepthRenderBufferStack>>();

    constructor(private readonly gl: WebGLRenderingContext) { }

    clearCache(): void {
        this.colorBuffers.forEach(v1 => {
            v1.forEach(v2 => v2.forEach(v3 => v3.deleteAll(this.gl)));
        });
        this.colorBuffers.clear();
        this.depthBuffers.forEach(v1 => {
            v1.forEach(v2 => v2.deleteAll(this.gl));
        });
        this.depthBuffers.clear();
    }

    nextColorBuffer(size: ReadonlyVector2d, flags: { multisample?: number; hdr?: boolean }, callback: (buffer: ColorRenderBuffer) => void): void {
        this.getColorBufferStackBySize(size, flags).next(callback, this.gl);
    }

    nextDepthBuffer(size: ReadonlyVector2d, callback: (buffer: DepthRenderBuffer) => void): void {
        this.getDepthBufferBySize(size).next(callback, this.gl);
    }

    private getColorBufferStackBySize(size: ReadonlyVector2d, flags: { multisample?: number; hdr?: boolean; }): ColorRenderBufferStack {
        let buf1 = this.colorBuffers.get(size.x);
        if (buf1 === undefined) {
            buf1 = new Map<number, Map<string, ColorRenderBufferStack>>();
            this.colorBuffers.set(size.x, buf1);
        }
        let buf2 = buf1.get(size.y);
        if (buf2 === undefined) {
            buf2 = new Map<string, ColorRenderBufferStack>();
            buf1.set(size.y, buf2);
        }
        const multisample = flags.multisample ?? 1;
        const hdr = flags.hdr ?? false;
        const key = `${hdr ? 'f' : 'b'}${multisample}`;
        let buf3 = buf2.get(key);
        if (buf3 === undefined) {
            buf3 = new ColorRenderBufferStack(size, multisample, hdr);
            buf2.set(key, buf3);
        }
        return buf3;
    }

    private getDepthBufferBySize(size: ReadonlyVector2d): DepthRenderBufferStack {
        let buf1 = this.depthBuffers.get(size.x);
        if (buf1 === undefined) {
            buf1 = new Map<number, DepthRenderBufferStack>();
            this.depthBuffers.set(size.x, buf1);
        }
        let buf2 = buf1.get(size.y);
        if (buf2 === undefined) {
            buf2 = new DepthRenderBufferStack(size);
            buf1.set(size.y, buf2);
        }
        return buf2;
    }
}
