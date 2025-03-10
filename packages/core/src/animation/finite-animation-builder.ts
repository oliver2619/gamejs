import { Animation, AnimationLoopMode, FiniteAnimationEvent, TransitionFunction } from "./animation";
import { FiniteAnimation } from "./finite-animation";
import { TransitionFunctions } from "./transition-funtions";

export class FiniteAnimationBuilder {

    private _delay = 0;
    private _pause = 0;
    private _loopMode: AnimationLoopMode = AnimationLoopMode.BOTH;
    private _onFinished: ((remainingTimeout: number) => void) | undefined;
    private _repetitions: number | undefined = 1;
    private _transitionFunction: TransitionFunction = TransitionFunctions.LINEAR;

    constructor(private readonly duration: number) { }

    delay(duration: number): FiniteAnimationBuilder {
        this._delay = duration;
        return this;
    }

    infinite(): FiniteAnimationBuilder {
        this._repetitions = undefined;
        return this;
    }

    loop(mode: AnimationLoopMode): FiniteAnimationBuilder {
        this._loopMode = mode;
        return this;
    }

    onAnimate(callback: (ev: FiniteAnimationEvent) => void): Animation {
        return new FiniteAnimation({
            duration: this.duration,
            onAnimate: callback,
            delay: this._delay,
            loopMode: this._loopMode,
            onFinished: this._onFinished,
            pause: this._pause,
            repetitions: this._repetitions,
            transitionFunction: this._transitionFunction
        });
    }

    onFinished(callback: (remainingTimeout: number) => void): FiniteAnimationBuilder {
        this._onFinished = callback;
        return this;
    }

    pause(duration: number): FiniteAnimationBuilder {
        this._pause = duration;
        return this;
    }

    repetitions(amount: number): FiniteAnimationBuilder {
        this._repetitions = amount;
        return this;
    }

    transition(fn: TransitionFunction): FiniteAnimationBuilder {
        this._transitionFunction = fn;
        return this;
    }
}