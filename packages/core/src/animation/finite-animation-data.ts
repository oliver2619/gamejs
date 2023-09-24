import { TransitionFunction } from "./transition-function";

export enum AnimationLoopMode {
    FORWARD, BACKWARD, BOTH, RANDOM
}

export interface FiniteAnimationData {
    delay?: number;
    duration: number;
    pause?: number;
    loopMode?: AnimationLoopMode;
    repetitions?: number;
    transitionFunction?: TransitionFunction;
}