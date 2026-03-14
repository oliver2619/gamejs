import { ImageCache, ImageObject, ReadonlyVector2d } from "@pluto/core";
import { TextureMipmapGenerator, TextureWrap } from "./texture";
import { Context3d } from "../context";
import { ImageTexture2d } from "./image-texture-2d";
import { ImageCubeTexture } from "./image-cube-texture";

export interface CubeTextureCacheDefinition {
    anisotropy?: number | undefined;
    imagePosX: string;
    imagePosY: string;
    imagePosZ: string;
    imageNegX: string;
    imageNegY: string;
    imageNegZ: string;
    imageFilter?: ((img: ImageObject) => ImageObject) | undefined;
    minFilter?: boolean | undefined;
    magFilter?: boolean | undefined;
    mipmaps?: TextureMipmapGenerator | undefined;
}

export interface Texture2dCacheDefinition {
    anisotropy?: number | undefined;
    image: string;
    imageFilter?: ((img: ImageObject) => ImageObject) | undefined;
    minFilter?: boolean | undefined;
    magFilter?: boolean | undefined;
    mipmaps?: TextureMipmapGenerator | undefined;
    physicalSize?: ReadonlyVector2d | undefined;
    wrapS?: TextureWrap | undefined;
    wrapT?: TextureWrap | undefined;
}

const cubeTextureRegistry = new Map<string, CubeTextureCacheDefinition>();
const texture2dRegistry = new Map<string, Texture2dCacheDefinition>();

export class TextureCache {

    private readonly cubeTextureCache = new Map<string, Promise<ImageCubeTexture>>();
    private readonly texture2dCache = new Map<string, Promise<ImageTexture2d>>();

    constructor(private readonly context: Context3d) { }

    static registerCubeTexture(id: string, data: CubeTextureCacheDefinition) {
        if (cubeTextureRegistry.has(id)) {
            throw new RangeError(`Cube texture with id ${id} already defined.`);
        }
        cubeTextureRegistry.set(id, { ...data });
    }

    static registerTexture2d(id: string, data: Texture2dCacheDefinition) {
        if (texture2dRegistry.has(id)) {
            throw new RangeError(`Texture 2d with id ${id} already defined.`);
        }
        texture2dRegistry.set(id, { ...data, physicalSize: data.physicalSize?.clone() });
    }

    getAllTexture2d<T>(...idList: Array<keyof T>): Promise<{ [P in keyof T]: ImageTexture2d }> {
        const promises = idList.map(it => this.getTexture2d(it as string));
        return Promise.all(promises).then(it => {
            const ret = {} as { [P in keyof T]: ImageTexture2d };
            idList.forEach((name, ix) => ret[name] = it[ix]!);
            return ret;
        });
    }

    getCubeTexture(id: string): Promise<ImageCubeTexture> {
        const found = this.cubeTextureCache.get(id);
        if (found != undefined) {
            return found;
        }
        const registry = cubeTextureRegistry.get(id);
        if (registry == undefined) {
            throw new RangeError(`Image cube texture with id ${id} not registered.`);
        }
        const ret = this.loadCubeTexture(registry).then(it => {
            it.onPostDelete.subscribeOnce(() => this.cubeTextureCache.delete(id));
            return it;
        });
        this.cubeTextureCache.set(id, ret);
        return ret;
    }

    getTexture2d(id: string): Promise<ImageTexture2d> {
        const found = this.texture2dCache.get(id);
        if (found != undefined) {
            return found;
        }
        const registry = texture2dRegistry.get(id);
        if (registry == undefined) {
            throw new RangeError(`Image texture 2d with id ${id} not registered.`);
        }
        const ret = this.loadTexture2d(registry).then(it => {
            it.onPostDelete.subscribeOnce(() => this.texture2dCache.delete(id));
            return it;
        });
        this.texture2dCache.set(id, ret);
        return ret;
    }

    private loadCubeTexture(data: CubeTextureCacheDefinition): Promise<ImageCubeTexture> {
        return ImageCache
            .getAll(
                data.imageNegX,
                data.imageNegY,
                data.imageNegZ,
                data.imagePosX,
                data.imagePosY,
                data.imagePosZ,
            )
            .then(images => Object.fromEntries(Object.entries(images).map(([key, res]) => [key, data.imageFilter == undefined ? res.image : data.imageFilter(res.image)])))
            .then(images => {
                const alpha = Object.values(images).some(it => it.alpha);
                return new ImageCubeTexture(this.context, {
                    images: {
                        negX: images[data.imageNegX]!.staticTextureImageSource,
                        negY: images[data.imageNegY]!.staticTextureImageSource,
                        negZ: images[data.imageNegZ]!.staticTextureImageSource,
                        posX: images[data.imagePosX]!.staticTextureImageSource,
                        posY: images[data.imagePosY]!.staticTextureImageSource,
                        posZ: images[data.imagePosZ]!.staticTextureImageSource,
                        alpha,
                    },
                    anisotropy: data.anisotropy,
                    magFilter: data.magFilter,
                    minFilter: data.minFilter,
                    mipmaps: data.mipmaps,
                });
            });
    }

    private loadTexture2d(data: Texture2dCacheDefinition): Promise<ImageTexture2d> {
        return ImageCache
            .get(data.image)
            .then(image => data.imageFilter == undefined ? image.image : data.imageFilter(image.image))
            .then(image => new ImageTexture2d(this.context, {
                image: image.staticTextureImageSource,
                alpha: image.alpha,
                anisotropy: data.anisotropy,
                magFilter: data.magFilter,
                minFilter: data.minFilter,
                mipmaps: data.mipmaps,
                physicalSize: data.physicalSize,
                wrapS: data.wrapS,
                wrapT: data.wrapS,
            }));
    }
}