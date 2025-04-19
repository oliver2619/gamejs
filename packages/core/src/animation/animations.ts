import { Color, ReadonlyColor } from "../color";
import { FiniteAnimationEvent, InfiniteAnimationEvent } from "./animation";

type ExcludeType<T, P> = {
    [K in keyof T as (T[K] extends P ? K : never)]: P
}

export class Animations {

    private constructor() { }

    static fadeValueFiniteAlong<T>(target: T, key: keyof ExcludeType<T, number>, trajectory: (ev: FiniteAnimationEvent) => number): (ev: FiniteAnimationEvent) => void {
        const t = target as ExcludeType<T, number>;
        let lastValue = t[key];
        return (ev: FiniteAnimationEvent) => {
            const nextValue = trajectory(ev);
            t[key] = t[key] + nextValue - lastValue;
            lastValue = nextValue;
        };
    }

    static fadeValueFiniteTo<T>(target: T, key: keyof ExcludeType<T, number>, value: number): (ev: FiniteAnimationEvent) => void {
        const start = (target as ExcludeType<T, number>)[key];
        const delta = value - start;
        return this.fadeValueFiniteAlong(target, key, ev => start + delta * ev.totalProgress);
    }

    static fadeValueInfiniteAlong<T>(target: T, key: keyof ExcludeType<T, number>, trajectory: (ev: InfiniteAnimationEvent) => number): (ev: InfiniteAnimationEvent) => void {
        const t = target as ExcludeType<T, number>;
        let lastValue = t[key];
        return (ev: InfiniteAnimationEvent) => {
            const nextValue = trajectory(ev);
            t[key] = t[key] + nextValue - lastValue;
            lastValue = nextValue;
        };
    }

    static fadeColorFiniteAlong<T>(target: T, key: keyof ExcludeType<T, ReadonlyColor>, trajectory: (ev: FiniteAnimationEvent, color: Color) => void): (ev: FiniteAnimationEvent) => void {
        const t = target as ExcludeType<T, ReadonlyColor>;
        const lastValue = t[key].clone();
        const nextValue = lastValue.clone();
        return (ev: FiniteAnimationEvent) => {
            trajectory(ev, nextValue);
            t[key] = t[key].getSum(nextValue).getDifference(lastValue);
            lastValue.setColor(nextValue);
        };
    }

    static fadeColorFiniteTo<T>(target: T, key: keyof ExcludeType<T, ReadonlyColor>, color: ReadonlyColor): (ev: FiniteAnimationEvent) => void {
        const start = (target as ExcludeType<T, Color>)[key].clone();
        const delta = color.getDifference(start);
        return this.fadeColorFiniteAlong(target, key, (ev, color) => {
            color.setColor(start);
            color.addScaled(delta, ev.totalProgress);
        });
    }

    static fadeColorInfniteAlong<T>(target: T, key: keyof ExcludeType<T, ReadonlyColor>, trajectory: (ev: InfiniteAnimationEvent, color: Color) => void): (ev: InfiniteAnimationEvent) => void {
        const t = target as ExcludeType<T, ReadonlyColor>;
        const lastValue = t[key].clone();
        const nextValue = lastValue.clone();
        return (ev: InfiniteAnimationEvent) => {
            trajectory(ev, nextValue);
            t[key] = t[key].getSum(nextValue).getDifference(lastValue);
            lastValue.setColor(nextValue);
        };
    }
}
