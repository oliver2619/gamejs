import { EventObservable } from "../event/event-observable";
import { Animation } from "./animation";
import { InfiniteAnimationEvent } from "./infinite-animation-event";

export class InfiniteAnimation implements Animation, InfiniteAnimationEvent {

    readonly onAnimate = new EventObservable<InfiniteAnimationEvent>();
    readonly onFinished = new EventObservable<Animation>();

    active = true;

    get timeout(): number {
        return this._timeout;
    }

    get totalTime(): number {
        return this._totalTime;
    }

    private _totalTime = 0;
    private _timeout = 0;

    constructor(callback?: (ev: InfiniteAnimationEvent) => void) {
        if(callback != undefined) {
            this.onAnimate.subscribe(callback);
        }
    }

    animate(timeout: number) {
        if (this.active) {
            this._totalTime += timeout;
            this._timeout = timeout;
            this.onAnimate.produce(this);
        }
    }

    stop() {
        this.onFinished.produce(this);
    }
}