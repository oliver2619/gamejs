import { Animation, InfiniteAnimationEvent } from "./animation";

export class InfiniteAnimation implements Animation, InfiniteAnimationEvent {

    enabled = true;

    private _totalTime = 0;
    private _timeout = 0;
    private stopped = false;

    get totalTime(): number {
        return this._totalTime;
    }

    get timeout(): number {
        return this._timeout;
    }

    constructor(private readonly onAnimate: (ev: InfiniteAnimationEvent) => void) { }

    animate(timeout: number, onFinished: (remainingTimeout: number) => void): void {
        if (this.enabled) {
            this._totalTime += timeout;
            this._timeout = timeout;
            this.onAnimate(this);
            if (this.stopped) {
                onFinished(0);
            }
        }
    }

    stop() {
        this.stopped = true;
    }
}