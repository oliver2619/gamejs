import { Animation, AnimationLoopMode, FiniteAnimationEvent, TransitionFunction } from "./animation";

export class FiniteAnimation implements Animation, FiniteAnimationEvent {

    enabled = true;

    private readonly pause: number;
    private readonly loopMode: AnimationLoopMode;
    private readonly duration: number;
    private readonly onAnimate: (ev: FiniteAnimationEvent) => void;
    private readonly onFinished: ((remainingTimeout: number) => void) | undefined;

    private transitionFunction: TransitionFunction;
    private delay: number;
    private repetitions: number | undefined;
    private stopped = false;
    private _timeout: number = 0;
    private _totalTime: number = 0;
    private _time: number = 0;
    private _totalProgress: number;
    private _progressStep: number = 0;
    private _forward: boolean = true;

    get forward(): boolean {
        return this._forward;
    }

    get progressStep(): number {
        return this._progressStep;
    }

    get timeout(): number {
        return this._timeout;
    }

    get totalProgress(): number {
        return this._totalProgress;
    }

    get totalTime(): number {
        return this._totalTime;
    }

    constructor(data: {
        delay: number;
        duration: number;
        pause: number;
        loopMode: AnimationLoopMode;
        repetitions: number | undefined;
        transitionFunction: TransitionFunction;
        onAnimate: (ev: FiniteAnimationEvent) => void;
        onFinished: ((remainingTimeout: number) => void) | undefined;
    }) {
        if (data.duration <= 0) {
            throw new RangeError('Duration must not be less or equal than 0');
        }
        if (data.delay < 0) {
            throw new RangeError('Delay must not be less than 0');
        }
        if (data.pause < 0) {
            throw new RangeError('Pause must not be less than 0');
        }
        this.delay = data.delay;
        this.duration = data.duration;
        this.pause = data.pause;
        this.loopMode = data.loopMode;
        this.transitionFunction = data.transitionFunction;
        this.repetitions = data.repetitions;
        this._forward = this.loopMode === AnimationLoopMode.FORWARD || this.loopMode === AnimationLoopMode.BOTH || (this.loopMode === AnimationLoopMode.RANDOM && Math.random() < 0.5);
        this._totalProgress = this._forward ? 0 : 1;
        this.onAnimate = data.onAnimate;
        this.onFinished = data.onFinished;
    }

    animate(timeout: number, onFinished: (remainingTimeout: number) => void): void {
        if (this.enabled) {
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
                        onFinished(timeout);
                        if (this.onFinished != undefined) {
                            this.onFinished(timeout);
                        }
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
            if (this.stopped) {
                onFinished(0);
                if (this.onFinished != undefined) {
                    this.onFinished(timeout);
                }
            }
        }
    }

    stop(): void {
        this.stopped = true;
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
        const oldProgress = this._totalProgress;
        this._totalProgress = this._forward ? p : 1 - p;
        this._progressStep = this._totalProgress - oldProgress;
        this.onAnimate(this);
    }
}