import { ReadonlyVector2d, Vector3d } from "@pluto/core";
import { Camera3d } from "../scene";
import { Context3d } from "../context";
import { FrameBufferCache } from "./frame-buffer-cache";
import { RenderBufferCache } from "./render-buffer-cache";
import { ColorRenderBuffer } from "./color-render-buffer";
import { DepthRenderBuffer } from "./depth-render-buffer";
import { ColorRenderTarget2d, ColorRenderTargetCube, DepthRenderTarget2d, DepthRenderTargetCube } from "./render-target";
import { FrameBuffer } from "./frame-buffer";
import { RenderTargetTextureCache } from "./render-target-texture-cache";
import { RenderTargetColorTexture2d } from "./render-target-color-texture-2d";
import { RenderTargetDepthCubeTexture } from "./render-target-depth-cube-texture";
import { RenderTargetDepthTexture2d } from "./render-target-depth-texture-2d";

const NEG_X = new Vector3d(-1, 0, 0);
const NEG_Y = new Vector3d(0, -1, 0);
const NEG_Z = new Vector3d(0, 0, -1);
const POS_X = new Vector3d(1, 0, 0);
const POS_Y = new Vector3d(0, 1, 0);
const POS_Z = new Vector3d(0, 0, 1);

export class RenderToTexture {

	private readonly frameBufferCache: FrameBufferCache;
	private readonly renderBufferCache: RenderBufferCache;
	private readonly textureCache: RenderTargetTextureCache;

	constructor(context: Context3d) {
		this.frameBufferCache = new FrameBufferCache(context.gl);
		this.renderBufferCache = new RenderBufferCache(context.gl);
		this.textureCache = new RenderTargetTextureCache(context);
	}

	clearCache() {
		this.frameBufferCache.clearCache();
		this.renderBufferCache.clearCache();
		this.textureCache.clearCache();
	}

	renderToCubeTexture(data: {
		colorTargets: ColorRenderTargetCube[],
		depthTarget: DepthRenderTargetCube,
		camera: Camera3d,
		callback: () => void,
	}) {
		this.frameBufferCache.use(data.colorTargets, () => {
			try {
				this.forEachFace(data.camera, activeFace => {
					data.colorTargets.forEach((target, layer) => target.beginRenderingToCube(layer, activeFace));
					data.depthTarget.beginRenderingToCube(activeFace);
					FrameBuffer.check();
					data.callback();
				});
			} finally {
				data.depthTarget.endRenderingToCube();
				data.colorTargets.forEach((target, layer) => target.endRenderingToCube(layer));
			}
		});
	}

	renderToTexture2d(data: {
		colorTargets: ColorRenderTarget2d[],
		depthTarget: DepthRenderTarget2d,
		callback: () => void,
	}) {
		this.frameBufferCache.use(data.colorTargets, () => {
			data.colorTargets.forEach((target, layer) => target.beginRenderingTo2d(layer));
			data.depthTarget.beginRenderingTo2d();
			try {
				FrameBuffer.check();
				data.callback();
			} finally {
				data.depthTarget.endRenderingTo2d();
				data.colorTargets.forEach((target, layer) => target.endRenderingTo2d(layer));
			}
		});
	}

	withColorRenderBuffer(size: ReadonlyVector2d, flags: { multisample?: number, hdr?: boolean }, callback: (buffer: ColorRenderBuffer) => void) {
		this.renderBufferCache.nextColorBuffer(size, flags, callback);
	}

	withColorTexture2d(size: ReadonlyVector2d, flags: { mipmaps?: boolean; alpha?: boolean; hdr?: boolean }, callback: (texture: RenderTargetColorTexture2d) => void) {
		this.textureCache.nextColorTexture2d(size, flags, callback);
	}

	withDepthCubeTexture(size: number, callback: (texture: RenderTargetDepthCubeTexture) => void) {
		this.textureCache.nextDepthCubeTexture(size, callback);
	}

	withDepthRenderBuffer(size: ReadonlyVector2d, callback: (buffer: DepthRenderBuffer) => any) {
		this.renderBufferCache.nextDepthBuffer(size, callback);
	}

	withDepthTexture2d(size: ReadonlyVector2d, callback: (texture: RenderTargetDepthTexture2d) => any) {
		this.textureCache.nextDepthTexture2d(size, callback);
	}

	private forEachFace(camera: Camera3d, callback: (textureTarget: GLenum) => void) {
		camera.setTargetDirection(NEG_X, NEG_Y);
		callback(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X);
		camera.setTargetDirection(NEG_Y, NEG_Z);
		callback(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y);
		camera.setTargetDirection(NEG_Z, NEG_Y);
		callback(WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z);
		camera.setTargetDirection(POS_X, NEG_Y);
		callback(WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X);
		camera.setTargetDirection(POS_Y, POS_Z);
		callback(WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y);
		camera.setTargetDirection(POS_Z, NEG_Y);
		callback(WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z);
	}
}