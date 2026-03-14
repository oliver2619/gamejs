import { ReadonlyVector2d, ReferencedObject, Vector2d } from "@pluto/core";
import { Context3d } from "../context";
import { RenderTargetDepthCubeTexture } from "./render-target-depth-cube-texture";
import { RenderTargetColorTexture2d } from "./render-target-color-texture-2d";
import { RenderTargetDepthTexture2d } from "./render-target-depth-texture-2d";
import { TextureMipmapGenerator, TextureWrap } from "../texture";

class TextureCache<T extends ReferencedObject> {

    private readonly textures: T[] = [];
    private nextIndex = 0;

    constructor(private readonly factory: () => T) { }

    clear(): void {
        this.textures.forEach(t => t.releaseReference(this));
        this.textures.splice(0, this.textures.length);
    }

    next(callback: (texture: T) => void) {
        if (this.textures.length <= this.nextIndex) {
            const ret = this.factory();
            this.textures.push(ret);
            ret.addReference(this);
        }
        const texture = this.textures[this.nextIndex++]!;
        try {
            callback(texture);
        } finally {
            --this.nextIndex;
        }
    }
}

class Cache2d {

    private readonly colorTextures = new Map<number, TextureCache<RenderTargetColorTexture2d>>();
    private readonly depthTextures: TextureCache<RenderTargetDepthTexture2d>;
    private readonly size: Vector2d;

    constructor(private readonly context: Context3d, size: ReadonlyVector2d) {
        this.depthTextures = new TextureCache<RenderTargetDepthTexture2d>(() => new RenderTargetDepthTexture2d(context, {
            stencil: false,
            size: this.size,
        }))
        this.size = size.clone();
    }

    clear(): void {
        this.colorTextures.forEach(v => v.clear());
        this.colorTextures.clear();
        this.depthTextures.clear();
    }

    nextColorTexture2D(flags: { mipmaps?: boolean; alpha?: boolean; hdr?: boolean }, callback: (texture: RenderTargetColorTexture2d) => void) {
        const hdr = this.context.colorBufferFloatSupported === true && flags.hdr === true;
        const key = (flags.alpha === true ? 1 : 0) | (flags.mipmaps === true ? 2 : 0) | (hdr ? 4 : 0);
        const linear = this.context.textureFloatLinearSupported || !hdr;
        let list = this.colorTextures.get(key);
        if (list === undefined) {
            list = new TextureCache<RenderTargetColorTexture2d>(() => new RenderTargetColorTexture2d(this.context, {
                alpha: flags.alpha === true,
                hdr: hdr,
                mipmaps: flags.mipmaps === true && linear ? TextureMipmapGenerator.FASTEST : TextureMipmapGenerator.NONE,
                magFilter: linear,
                minFilter: linear,
                size: this.size,
                wrapS: TextureWrap.CLAMP,
                wrapT: TextureWrap.CLAMP
            }));
            this.colorTextures.set(key, list);
        }
        list.next(callback);
    }

    nextDepthTexture2D(callback: (texture: RenderTargetDepthTexture2d) => void) {
        this.depthTextures.next(callback);
    }
}

class CubeCache {

    private readonly depthTextures: TextureCache<RenderTargetDepthCubeTexture>;

    constructor(context: Context3d, size: number) {
        this.depthTextures = new TextureCache<RenderTargetDepthCubeTexture>(() => new RenderTargetDepthCubeTexture(context, { size: size }));
    }

    clear(): void {
        this.depthTextures.clear();
    }

    nextDepthCubeTexture(callback: (texture: RenderTargetDepthCubeTexture) => void) {
        this.depthTextures.next(callback);
    }
}

export class RenderTargetTextureCache {

    private readonly cache2dByWidth = new Map<number, Map<number, Cache2d>>();
    private readonly cubeCacheBySize = new Map<number, CubeCache>();

    constructor(private readonly context: Context3d) { }

    clearCache() {
        this.cache2dByWidth.forEach(cacheByHeight => {
            cacheByHeight.forEach(cache => cache.clear());
        });
        this.cache2dByWidth.clear();
        this.cubeCacheBySize.forEach(cache => cache.clear());
        this.cubeCacheBySize.clear();
    }

    nextColorTexture2d(size: ReadonlyVector2d, flags: { mipmaps?: boolean; alpha?: boolean; hdr?: boolean }, callback: (texture: RenderTargetColorTexture2d) => void) {
        this.getCache2d(this.context.roundTexture2dSize(size)).nextColorTexture2D(flags, callback);
    }

    nextDepthCubeTexture(size: number, callback: (texture: RenderTargetDepthCubeTexture) => void) {
        this.getCachesCube(this.context.roundCubeTextureSize(size)).nextDepthCubeTexture(callback);
    }

    nextDepthTexture2d(size: ReadonlyVector2d, callback: (texture: RenderTargetDepthTexture2d) => void) {
        this.getCache2d(this.context.roundTexture2dSize(size)).nextDepthTexture2D(callback);
    }

    private getCache2d(size: ReadonlyVector2d): Cache2d {
        let cacheByHeight = this.cache2dByWidth.get(size.x);
        if (cacheByHeight === undefined) {
            cacheByHeight = new Map<number, Cache2d>();
            this.cache2dByWidth.set(size.x, cacheByHeight);
        }
        let ret = cacheByHeight.get(size.y);
        if (ret === undefined) {
            ret = new Cache2d(this.context, size);
            cacheByHeight.set(size.y, ret);
        }
        return ret;
    }

    private getCachesCube(size: number): CubeCache {
        let ret = this.cubeCacheBySize.get(size);
        if (ret === undefined) {
            ret = new CubeCache(this.context, size);
            this.cubeCacheBySize.set(size, ret);
        }
        return ret;
    }
}