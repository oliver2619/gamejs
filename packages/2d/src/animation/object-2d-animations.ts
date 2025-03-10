import { FiniteAnimationEvent, InfiniteAnimationEvent, ReadonlyVector2d, Vector2d } from "@pluto/core";
import { Object2dBase } from "../scene";

export class Object2dAnimations {

    private constructor() { }

    static rotateFiniteRelative(target: Object2dBase, amount: number): (ev: FiniteAnimationEvent) => void {
        const angle = amount * Math.PI * 2;
        return (ev: FiniteAnimationEvent) => {
            target.updateCoordSystem(coordSystem => coordSystem.rotate(angle * ev.progressStep));
        };
    }

    static rotateFiniteAlong(target: Object2dBase, trajectory: (ev: FiniteAnimationEvent) => number): (ev: FiniteAnimationEvent) => void {
        let lastAngle = target.coordSystem.rotation;
        const factor = Math.PI * 2;
        return (ev: FiniteAnimationEvent) => {
            const nextAngle = trajectory(ev) * factor;
            target.updateCoordSystem(coordSystem => coordSystem.rotate(nextAngle - lastAngle));
            lastAngle = nextAngle;
        };
    }

    static rotateInfinite(target: Object2dBase, frequency: number): (ev: InfiniteAnimationEvent) => void {
        const speed = Math.PI * 2 * frequency;
        return (ev: InfiniteAnimationEvent) => {
            target.updateCoordSystem(coordSystem => coordSystem.rotate(speed * ev.timeout));
        };
    }

    static rotateInfiniteAlong(target: Object2dBase, trajectory: (ev: InfiniteAnimationEvent) => number): (ev: InfiniteAnimationEvent) => void {
        let lastAngle = target.coordSystem.rotation;
        const factor = Math.PI * 2;
        return (ev: InfiniteAnimationEvent) => {
            const nextAngle = trajectory(ev) * factor;
            target.updateCoordSystem(coordSystem => coordSystem.rotate(nextAngle - lastAngle));
            lastAngle = nextAngle;
        };
    }

    static scaleFiniteAlong(target: Object2dBase, trajectory: (ev: FiniteAnimationEvent) => number): (ev: FiniteAnimationEvent) => void {
        let lastScaleX = target.coordSystem.xAxis.length;
        let lastScaleY = target.coordSystem.yAxis.length;
        return (ev: FiniteAnimationEvent) => {
            target.updateCoordSystem(coordSystem => {
                const scale = trajectory(ev);
                if (scale > 0) {
                    coordSystem.xAxis.length *= scale / lastScaleX;
                    coordSystem.yAxis.length *= scale / lastScaleY;
                    lastScaleX = scale;
                    lastScaleY = scale;
                }
            });
        };
    }

    static scaleFiniteRelative(target: Object2dBase, scale: number): (ev: FiniteAnimationEvent) => void {
        if (scale <= 0) {
            throw new RangeError('Scale must be greater than zero.');
        }
        return this.scaleFiniteAlong(target, (ev) => Math.pow(scale, ev.totalProgress));
    }

    static scaleInfiniteAlong(target: Object2dBase, trajectory: (ev: InfiniteAnimationEvent) => number): (ev: InfiniteAnimationEvent) => void {
        let lastScaleX = target.coordSystem.xAxis.length;
        let lastScaleY = target.coordSystem.yAxis.length;
        return (ev: InfiniteAnimationEvent) => {
            target.updateCoordSystem(coordSystem => {
                const scale = trajectory(ev);
                if (scale > 0) {
                    coordSystem.xAxis.length *= scale / lastScaleX;
                    coordSystem.yAxis.length *= scale / lastScaleY;
                    lastScaleX = scale;
                    lastScaleY = scale;
                }
            });
        };
    }

    static translateFiniteTo(target: Object2dBase, endPosition: ReadonlyVector2d): (ev: FiniteAnimationEvent) => void {
        const start = target.coordSystem.position.clone();
        const delta = endPosition.getDifference(start);
        return this.translateFiniteAlong(target, (ev, pos) => {
            pos.setVector(start);
            pos.addScaled(delta, ev.totalProgress);
        });
    }

    static translateFiniteRelative(target: Object2dBase, direction: ReadonlyVector2d): (ev: FiniteAnimationEvent) => void {
        const dir = direction.clone();
        return (ev: FiniteAnimationEvent) => {
            target.updateCoordSystem(coordSystem => coordSystem.position.addScaled(dir, ev.progressStep));
        };
    }

    static translateFiniteAlong(target: Object2dBase, trajectory: (ev: FiniteAnimationEvent, position: Vector2d) => void): (ev: FiniteAnimationEvent) => void {
        const lastPosition = target.coordSystem.position.clone();
        const currentPosition = lastPosition.clone();
        return (ev: FiniteAnimationEvent) => {
            trajectory(ev, currentPosition);
            target.updateCoordSystem(coordSystem => {
                coordSystem.position.add(currentPosition);
                coordSystem.position.subtract(lastPosition);
            });
            lastPosition.setVector(currentPosition);
        };
    }

    static translateInfiniteAlong(target: Object2dBase, trajectory: (ev: InfiniteAnimationEvent, position: Vector2d) => void): (ev: InfiniteAnimationEvent) => void {
        const lastPosition = target.coordSystem.position.clone();
        const currentPosition = lastPosition.clone();
        return (ev: InfiniteAnimationEvent) => {
            trajectory(ev, currentPosition);
            target.updateCoordSystem(coordSystem => {
                coordSystem.position.add(currentPosition);
                coordSystem.position.subtract(lastPosition);
            });
            lastPosition.setVector(currentPosition);
        };
    }
}