import { ReadonlyVector2d } from "@pluto/core";

export interface RenderTarget {
    readonly viewportSize: ReadonlyVector2d;
}

export interface ColorRenderTarget extends RenderTarget {
}

export interface ColorRenderTarget2d extends ColorRenderTarget {

    readonly hdr: boolean;

    beginRenderingTo2d(layer: number): void;

    endRenderingTo2d(layer: number): void;
}

export interface ColorRenderTargetCube extends ColorRenderTarget {

    beginRenderingToCube(layer: number, activeFace: GLenum): void;

    endRenderingToCube(layer: number): void;
}

export interface DepthRenderTarget2d extends RenderTarget {

    beginRenderingTo2d(): void;

    endRenderingTo2d(): void;
}

export interface DepthRenderTargetCube extends RenderTarget {

    beginRenderingToCube(activeFace: GLenum): void;

    endRenderingToCube(): void;
}