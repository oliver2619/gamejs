import { FiniteAnimationEvent, InfiniteAnimationEvent } from "@pluto/core";
import { Camera2d } from "../scene";

export class Camera2dAnimations {

    private constructor() { }

    static zoomFiniteTo(camera: Camera2d, zoom: number): (ev: FiniteAnimationEvent) => void {
        if (zoom <= 0) {
            throw new RangeError('Zoom must be greater than zero.');
        }
        return this.zoomFiniteAlong(camera, (ev) => Math.pow(zoom, ev.totalProgress));
    }

    static zoomFiniteAlong(camera: Camera2d, trajectory: (ev: FiniteAnimationEvent) => number): (ev: FiniteAnimationEvent) => void {
        let lastZoom = camera.zoom;
        return (ev: FiniteAnimationEvent) => {
            const zoom = trajectory(ev);
            if (zoom > 0) {
                camera.zoom *= zoom / lastZoom;
                lastZoom = zoom;
            }
        };
    }

    static zoomInfiniteAlong(camera: Camera2d, trajectory: (ev: InfiniteAnimationEvent) => number): (ev: InfiniteAnimationEvent) => void {
        let lastZoom = camera.zoom;
        return (ev: InfiniteAnimationEvent) => {
            const zoom = trajectory(ev);
            if (zoom > 0) {
                camera.zoom *= zoom / lastZoom;
                lastZoom = zoom;
            }
        };
    }
}