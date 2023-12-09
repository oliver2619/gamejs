import { EventObservable } from "../event/event-observable";

abstract class TimerImp {

    abstract readonly timeout: number | undefined;

    private lastTime = 0;
    private _fps: number = 0;

    get fps(): number {
        return this._fps;
    }

    protected constructor(protected readonly callback: (timeout: number) => void) {
    }

    abstract start(): void;

    abstract stop(): void;

    protected reset() {
        this.lastTime = performance.now();
    }

    protected processTimer() {
        const time = performance.now();
        const dt = (time - this.lastTime) / 1000;
        if (dt > 0) {
            this._fps = 1 / dt;
            try {
                this.callback(dt);
            } finally {
                this.lastTime = time;
            }
        }

    }
}

class TimerImpFixedFps extends TimerImp {

    private timerId: number | undefined;

    constructor(callback: (timeout: number) => void, public readonly timeout: number) {
        super(callback);
    }

    start() {
        if (this.timerId == undefined) {
            this.reset();
            this.timerId = setInterval(() => this.processTimer(), this.timeout) as unknown as number;
        }
    }

    stop() {
        if (this.timerId != undefined) {
            clearInterval(this.timerId);
            this.timerId = undefined;
        }
    }
}

class TimerImpMaxFps extends TimerImp {

    readonly timeout: number | undefined = undefined;

    private timerId: number | undefined;
    private running = false;

    constructor(callback: (timeout: number) => void) {
        super(callback);
    }

    start() {
        if (!this.running) {
            this.running = true;
            const cb = () => {
                this.timerId = undefined;
                try {
                    this.processTimer();
                } finally {
                    if (this.running) {
                        this.timerId = requestAnimationFrame(cb);
                    }
                }
            };
            this.reset();
            this.timerId = requestAnimationFrame(cb);
        }
    }

    stop() {
        if (this.running) {
            this.running = false;
            if (this.timerId != undefined) {
                cancelAnimationFrame(this.timerId);
                this.timerId = undefined;
            }
        }
    }
}

export interface TimerData {
    fps?: number;
    rate?: number;
}

export class Timer {

    readonly onTimer = new EventObservable<number>();

    rate: number;

    private timerCallback = (timeout: number) => this.onTimer.produce(timeout * this.rate);
    private timer: TimerImp;
    private _active = false;

    get active(): boolean {
        return this._active;
    }

    set active(a: boolean) {
        if (this._active !== a) {
            this._active = a;
            if (this._active) {
                this.timer.start();
            } else {
                this.timer.stop();
            }
        }
    }

    get fps(): number {
        return this.timer.fps;
    }

    constructor(data?: TimerData) {
        const timeout = data == undefined || data.fps == undefined || data.fps <= 0 || data.fps > 1000 ? undefined : ((1000 / data.fps) | 0);
        this.timer = timeout == undefined ? new TimerImpMaxFps(this.timerCallback) : new TimerImpFixedFps(this.timerCallback, timeout);
        this.rate = data == undefined || data.rate == undefined ? 1 : data.rate;
    }

    setFixedFps(fps: number | undefined) {
        const timeout = fps == undefined || fps <= 0 || fps > 1000 ? undefined : ((1000 / fps) | 0);
        if (timeout !== this.timer.timeout) {
            if (this._active) {
                this.timer.stop();
            }
            this.timer = timeout == undefined ? new TimerImpMaxFps(this.timerCallback) : new TimerImpFixedFps(this.timerCallback, timeout);
            if (this._active) {
                this.timer.start();
            }
        }
    }
}