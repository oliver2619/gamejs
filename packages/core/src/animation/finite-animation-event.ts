import { InfiniteAnimationEvent } from "./infinite-animation-event";

export interface FiniteAnimationEvent extends InfiniteAnimationEvent {

    readonly forward: boolean;
    readonly progress: number;
    readonly deltaProgress: number;
}