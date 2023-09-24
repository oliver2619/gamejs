export interface InfiniteAnimationEvent {

    readonly timeout: number;
    readonly totalTime: number;

    stop(): void;
}