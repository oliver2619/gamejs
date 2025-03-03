import { EventObservable } from "../observable/event-observable";
import { Observable } from "../observable/observable";

export interface PromisesProgressEvent {
    readonly loaded: number;
    readonly total: number;
}

export class PromisesProgress {

    private readonly _onProgress = new EventObservable<PromisesProgressEvent>();
    private total = 0;
    private loaded = 0;
    private result: Promise<void>;
    private resolveCallback: (() => void) | undefined;

    get onProgress(): Observable<PromisesProgressEvent> {
        return this._onProgress;
    }

    constructor() {
        this.result = new Promise((resolve, _) => {
            this.resolveCallback = resolve;
        });
    }

    add<T>(promise: Promise<T>): Promise<T> {
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

    wait(): Promise<void> {
        return this.result;
    }

    private onProgressChange() {
        this._onProgress.next({ loaded: this.loaded, total: this.total });
        if (this.loaded === this.total && this.resolveCallback != undefined) {
            this.resolveCallback();
        }
    }
}