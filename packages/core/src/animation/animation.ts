export interface Animation {
    enabled: boolean;
    animate(timeout: number, onFinished: (remainingTimeout: number) => void): void;
}

export interface AnimationContainer extends Animation {
    addAnimation(animation: Animation): void;
}

export interface InfiniteAnimationEvent {

    readonly timeout: number;
    readonly totalTime: number;

    stop(): void;
}

export interface FiniteAnimationEvent extends InfiniteAnimationEvent {

    readonly forward: boolean;
    readonly totalProgress: number;
    readonly progressStep: number;
}

export type TransitionFunction = (progress: number) => number;

export enum AnimationLoopMode {
    FORWARD, BACKWARD, BOTH, RANDOM
}
