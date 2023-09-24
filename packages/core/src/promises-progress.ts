import { EventObservable } from "./event/event-observable";

export interface ProgressEvent {
    loaded: number;
    total: number;
}

export class PromisesProgress {

    readonly onError = new EventObservable<Error>();
    readonly onProgress = new EventObservable<ProgressEvent>();

    private readonly promise: Promise<number>;

    private completedCallback: ((loaded: number) => void) | undefined;
    private rejectedCallback: ((reason: Error) => void) | undefined;
    private loading = 0;
    private completed = 0;

    constructor() {
        this.promise = new Promise<number>((completed, rejected) => {
            this.completedCallback = completed;
            this.rejectedCallback = rejected;
        });
    }

    add(promise: Promise<any>): Promise<any> {
        ++this.loading;
        this.produceOnProgressEvent();
        return promise.then(_ => {
            --this.loading;
            ++this.completed;
            this.produceOnProgressEvent();
            if (this.loading === 0) {
                this.completedCallback!(this.completed);
            }
        }, reason => {
            --this.loading;
            this.onError.produce(reason);
            this.rejectedCallback!(reason);
        });
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