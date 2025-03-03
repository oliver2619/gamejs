import { EventObservable } from "./observable/event-observable";
import { Observable } from "./observable/observable";

interface TimerImp {

    stop(): void;
}

class TimerImpFixedFps implements TimerImp {

    private readonly timer: number;

    constructor(timeout: number, callback: () => void) {
        this.timer = window.setInterval(callback, timeout);
    }

    stop() {
        window.clearInterval(this.timer);
    }
}

class TimerImpMaxFps implements TimerImp {

    private timer: number | undefined;
    private mustStop = false;

    constructor(callback: () => void) {
        this.timer = window.requestAnimationFrame(() => this.onAnimation(callback));
    }

    stop() {
        if (this.timer == undefined) {
            this.mustStop = true;
        } else {
            window.cancelAnimationFrame(this.timer);
            this.timer = undefined;
        }
    }

    private onAnimation(callback: () => void) {
        this.timer = undefined;
        callback();
        if (!this.mustStop) {
            this.timer = window.requestAnimationFrame(() => this.onAnimation(callback));
        }
    }
}

export type TimerCallback = (timeout: number) => void;

export class Timer {

    simulationRate = 1;

    private readonly _onTimer = new EventObservable<number>(_ => this.updateStatus());
    private _enabled: boolean;
    private _fps: number | undefined;
    private _timerImp: TimerImp | undefined = undefined;
    private _lastTime: number = performance.now();
    private _currentFps = 0;

    get active(): boolean {
        return this._enabled && this._onTimer.hasSubscriptions;
    }

    get currentFps(): number {
        return this.active ? this._currentFps : 0;
    }

    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(e: boolean) {
        if (this._enabled !== e) {
            this._enabled = e;
            this.updateStatus();
        }
    }

    get fps(): number | undefined {
        return this._fps;
    }

    set fps(fps: number | undefined) {
        if (fps != undefined && fps <= 0) {
            throw new RangeError(`FPS must be a value > 0 or undefined`);
        }
        if (this._fps !== fps) {
            this.stop();
            this._fps = fps;
            if (this.active) {
                this.start();
            }
        }
    }

    get onTimer(): Observable<number> {
        return this._onTimer;
    }

    constructor(data?: { fps?: number | undefined, disabled?: boolean }) {
        this._fps = data?.fps;
        this._enabled = !(data?.disabled ?? false);
    }

    private process() {
        const current = performance.now();
        const timeout = (current - this._lastTime) / 1000;
        this._lastTime = current;
        if (timeout > 0) {
            this._currentFps = 1 / timeout;
            this._onTimer.next(timeout * this.simulationRate);
        }
    }

    private start() {
        if (this._timerImp == undefined) {
            const timeout = this._fps == undefined ? undefined : (Math.round(1000 / this._fps) | 0);
            this._lastTime = performance.now();
            if (timeout == undefined || timeout <= 0) {
                this._timerImp = new TimerImpMaxFps(() => this.process());
            } else {
                this._timerImp = new TimerImpFixedFps(timeout, () => this.process());
            }
        }
    }

    private stop() {
        if (this._timerImp != undefined) {
            this._timerImp.stop();
            this._timerImp = undefined;
        }
    }

    private updateStatus() {
        if (this.active) {
            this.start();
        } else {
            this.stop();
        }
    }
}