import { EventObservable } from "./event/event-observable";

export interface ProgressEvent {
    loaded: number;
    total: number;
}

export class PromisesProgress {

    readonly onError = new EventObservable<Error>();
    readonly onProgress = new EventObservable<ProgressEvent>();

    private readonly promise: Promise<number>;

    private completedCallback: Array<(loaded: number) => void> = [];
    private rejectedCallback: Array<(reason: Error) => void> = [];
    private loading = 0;
    private completed = 0;
    private error: Error | undefined;

    constructor() {
        this.promise = new Promise<number>((completed, rejected) => {
            this.completedCallback.push(completed);
            this.rejectedCallback.push(rejected);
            if (this.loading === 0) {
                completed(this.completed);
            }
            else if (this.error != undefined) {
                rejected(this.error);
            }
        });
    }

    add<T>(promise: Promise<T>): Promise<T> {
        ++this.loading;
        this.produceOnProgressEvent();
        return promise.then(it => {
            --this.loading;
            ++this.completed;
            this.produceOnProgressEvent();
            if (this.loading === 0) {
                setTimeout(() => this.completedCallback.forEach(it => it(this.completed)), 1);
            }
            return it;
        }, reason => {
            this.error = reason;
            --this.loading;
            this.onError.produce(reason);
            this.rejectedCallback.forEach(it => it(reason));
        }) as Promise<T>;
    }

    wait(): Promise<number> {
        return this.promise;
    }

    private produceOnProgressEvent() {
        this.onProgress.produce({
            loaded: this.completed,
            total: this.loading + this.completed
        });
    }
}