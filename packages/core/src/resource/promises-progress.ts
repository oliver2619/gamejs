import { EventObservable } from "../observable/event-observable";
import { Observable } from "../observable/observable";

export interface PromisesProgressEvent {
    readonly loaded: number;
    readonly total: number;
}

export interface PromiseWithProgress<T> {
    readonly result: Promise<T>;
    setProgress(loaded: number, total: number): void;
}

interface Item {
    loaded: number;
    total: number;
}
export class PromisesProgress {

    private static readonly _onProgress = new EventObservable<PromisesProgressEvent>();
    private static result: Promise<void> = this.createResultPromise();
    private static resolveCallback: (() => void) = () => { };
    private static inProgress = new Map<Promise<any>, Item>();
    private static totalLoaded = 0;

    static get onProgress(): Observable<PromisesProgressEvent> {
        return this._onProgress;
    }

    static add<T>(promise: Promise<T>): PromiseWithProgress<T> {
        if (this.inProgress.size === 0) {
            this.reset();
        }
        const progress: Item = { loaded: 0, total: 1 };
        this.inProgress.set(promise, progress);
        this.onProgressChange();
        const returnedPromise = promise.then(it => {
            this.totalLoaded += progress.total;
            this.inProgress.delete(promise);
            this.onProgressChange();
            return it;
        }).catch(reason => {
            this.inProgress.delete(promise);
            this.onProgressChange();
            throw reason;
        });
        const ret: PromiseWithProgress<T> = {
            result: returnedPromise,
            setProgress: (loaded: number, total: number) => {
                progress.loaded = loaded;
                progress.total = total;
            }
        };
        return ret;
    }

    static wait(): Promise<void> {
        return this.result;
    }

    private static createResultPromise(): Promise<void> {
        return new Promise((resolve, _) => {
            this.resolveCallback = resolve;
        });
    }

    private static onProgressChange() {
        let loaded = this.totalLoaded;
        let total = this.totalLoaded;
        this.inProgress.forEach(it => {
            loaded += it.loaded;
            total += it.total;
        });
        this._onProgress.next({ loaded, total });
        if (this.inProgress.size === 0) {
            this.resolveCallback();
        }
    }

    private static reset() {
        this.totalLoaded = 0;
        this.result = this.createResultPromise();
    }
}