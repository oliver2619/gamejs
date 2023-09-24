import { EventObservable } from "../event/event-observable";
import { Animation } from "./animation";
import { AnimationLoopMode, FiniteAnimationData } from "./finite-animation-data";
import { FiniteAnimationEvent } from "./finite-animation-event";
import { TransitionFunction } from "./transition-function";
import { TransitionFunctions } from "./transition-funtions";

export class FiniteAnimation implements Animation, FiniteAnimationEvent {

    readonly onAnimate = new EventObservable<FiniteAnimationEvent>();
    readonly onFinished = new EventObservable<Animation>();

    active = true;

    private readonly pause: number;
    private readonly loopMode: AnimationLoopMode;
    private readonly duration: number;

    private transitionFunction: TransitionFunction;
    private delay: number;
    private repetitions: number | undefined;
    private _timeout: number = 0;
    private _totalTime: number = 0;
    private _time: number = 0;
    private _progress: number;
    private _deltaProgress: number = 0;
    private _forward: boolean = true;

    get deltaProgress(): number {
        return this._deltaProgress;
    }

    get forward(): boolean {
        return this._forward;
    }

    get progress(): number {
        return this._progress;
    }

    get timeout(): number {
        return this._timeout;
    }

    get totalTime(): number {
        return this._totalTime;
    }

    constructor(data: FiniteAnimationData) {
        if (data.duration <= 0) {
            throw new RangeError('Duration must not be less or equal than 0');
        }
        this.delay = data.delay == undefined || data.delay < 0 ? 0 : data.delay;
        this.duration = data.duration;
        this.pause = data.pause == undefined || data.pause < 0 ? 0 : data.pause;
        this.loopMode = data.loopMode == undefined ? AnimationLoopMode.FORWARD : data.loopMode;
        this.transitionFunction = data.transitionFunction == undefined ? TransitionFunctions.LINEAR : data.transitionFunction;
        this.repetitions = data.repetitions;
        this._forward = this.loopMode === AnimationLoopMode.FORWARD || this.loopMode === AnimationLoopMode.BOTH || (this.loopMode === AnimationLoopMode.RANDOM && Math.random() < 0.5);
        this._progress = this._forward ? 0 : 1;
    }

    animate(timeout: number) {
        if (this.active) {
            this._timeout = 0;
            while (timeout > 0) {
                if (this.delay > 0) {
                    if (timeout > this.delay) {
                        timeout -= this.delay;
                        this._timeout += this.delay;
                        this._totalTime += this.delay;
                        this.delay = 0;
                    } else {
                        this.delay -= timeout;
                        this._timeout += timeout;
                        this._totalTime += timeout;
                        break;
                    }
                }
                if (this._time + timeout >= this.duration) {
                    const t = this.duration - this._time;
                    this._time = this.duration;
                    timeout -= t;
                    this._timeout += t;
                    this._totalTime += t;
                    if (this.repetitions == undefined || this.repetitions > 1) {
                        this.nextPhase();
                    } else {
                        this.process();
                        this.onFinished.produce(this);
                        return;
                    }
                } else {
                    this._time += timeout;
                    this._timeout += timeout;
                    this._totalTime += timeout;
                    break;
                }
            }
            this.process();
        }
    }

    stop() {
        this.onFinished.produce(this);
    }

    private nextPhase() {
        if (this.repetitions != undefined) {
            --this.repetitions;
        }
        this._time = 0;
        if (this.loopMode === AnimationLoopMode.BOTH || (this.loopMode === AnimationLoopMode.RANDOM && Math.random() < 0.5)) {
            this._forward = !this._forward;
        }
        if (this.pause > 0) {
            this.delay = this.pause;
        }
    }

    private process() {
        const p = this.transitionFunction(this._time / this.duration);
        const oldProgress = this._progress;
        this._progress = this._forward ? p : 1 - p;
        this._deltaProgress = this._progress - oldProgress;
        this.onAnimate.produce(this);
    }
}