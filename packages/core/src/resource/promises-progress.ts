import { EventObservable } from "../observable/event-observable";
import { Observable } from "../observable/observable";

export interface PromisesProgressEvent {
    readonly loaded: number;
    readonly total: number;
}

export class PromisesProgress {

    private static readonly _onProgress = new EventObservable<PromisesProgressEvent>();
    private static total = 0;
    private static loaded = 0;
    private static result: Promise<void> = this.createResultPromise();
    private static resolveCallback: (() => void) = () => { };

    static get onProgress(): Observable<PromisesProgressEvent> {
        return this._onProgress;
    }

    static add<T>(promise: Promise<T>): Promise<T> {
        if(this.total === this.loaded && this.total > 0) {
            this.reset();
        }
        ++this.total;
        this.onProgressChange();
        return promise.then(it => {
            ++this.loaded;
            this.onProgressChange();
            return it;
        }).catch(reason => {
            --this.total;
            this.onProgressChange();
            throw reason;
        });
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
        this._onProgress.next({ loaded: this.loaded, total: this.total });
        if (this.loaded === this.total) {
            this.resolveCallback();
        }
    }

    private static reset() {
        this.total -= this.loaded;
        this.loaded = 0;
        this.result = this.createResultPromise();
    }
}