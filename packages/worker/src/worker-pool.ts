class WorkerAdapter {

    constructor(private readonly worker: Worker) { }

    call<O>(input: any, transfer?: Transferable[]): Promise<O> {
        return new Promise<O>((resolve, reject) => {
            const unregister = () => {
                this.worker.removeEventListener('message', onMessage);
                this.worker.removeEventListener('messageerror', onMessageError);
                this.worker.removeEventListener('error', onError);
            }
            const onMessage = (ev: MessageEvent) => {
                unregister();
                resolve(ev.data);
            };
            const onMessageError = () => {
                unregister();
                reject(new Error('Failed to send message to worker.'));
            };
            const onError = (ev: ErrorEvent) => {
                unregister();
                reject(new Error(ev.message));
            };
            this.worker.addEventListener('message', onMessage);
            this.worker.addEventListener('messageerror', onMessageError);
            this.worker.addEventListener('error', onError);
            this.worker.postMessage(input, transfer ?? []);
        });
    }

    terminate() {
        this.worker.terminate();
    }
}

class WaitingElement {
    private onResolve: ((it: WorkerAdapter) => void) | undefined;

    readonly promise = new Promise<WorkerAdapter>((resolve, _reject) => this.onResolve = resolve);

    setNextFreeAdapter(adapter: WorkerAdapter) {
        if (this.onResolve != undefined) {
            this.onResolve(adapter);
        }
    }
}

export class WorkerPool {

    private readonly factory: () => (Worker | Promise<Worker>);
    private readonly maxNumberOfWorkers: number;
    private readonly idleWorkers: WorkerAdapter[] = [];
    private readonly waitingElements: WaitingElement[] = [];

    private numberOfWorkers = 0;
    private onTerminatedCallback: (() => void) | undefined;
    private onTerminatePromise: Promise<void> | undefined;

    private get shouldTerminate(): boolean {
        return this.onTerminatePromise != undefined;
    }

    constructor(data: {
        readonly workerFactory: () => (Worker | Promise<Worker>),
        readonly minThreads?: number | undefined,
        readonly maxThreads?: number | undefined,
        readonly threadsFactor?: number | undefined,
    }) {
        this.factory = data.workerFactory;
        if (data.minThreads != undefined && data.maxThreads != undefined && data.maxThreads < data.minThreads) {
            throw new RangeError('MaxTheads must be greater or equal than minThreads.');
        }
        const hwMax = navigator.hardwareConcurrency;
        const max1 = Math.round((data.threadsFactor ?? 1) * hwMax);
        const max2 = data.maxThreads ?? hwMax;
        const min = data.minThreads ?? 1;
        this.maxNumberOfWorkers = Math.max(min, Math.min(max1, max2, hwMax), 1) | 0;
    }

    call<O>(input: any): Promise<O> {
        if (this.shouldTerminate) {
            throw new Error('Worker pool terminated.');
        }
        const next = this.idleWorkers.pop();
        if (next == undefined) {
            if (this.numberOfWorkers < this.maxNumberOfWorkers) {
                const worker = this.factory();
                if (worker instanceof Worker) {
                    const workerAdapter = new WorkerAdapter(worker);
                    return workerAdapter.call<O>(input).then(ret => {
                        this.pushBackIdleWorker(workerAdapter);
                        return ret;
                    });
                } else {
                    return worker
                        .then(w => new WorkerAdapter(w))
                        .then(workerAdapter => workerAdapter.call<O>(input).then(ret => {
                            this.pushBackIdleWorker(workerAdapter);
                            return ret;
                        }));
                }
            } else {
                return this.waitForIdleWorker().then(worker => {
                    return worker.call<O>(input).then(ret => {
                        this.pushBackIdleWorker(worker);
                        return ret;
                    });
                });
            }
        } else {
            return next.call<O>(input).then(ret => {
                this.pushBackIdleWorker(next);
                return ret;
            }, err => {
                this.pushBackIdleWorker(next);
                throw err;
            });
        }
    }

    terminate(): Promise<void> {
        if (this.onTerminatePromise == undefined) {
            this.numberOfWorkers -= this.idleWorkers.length;
            this.idleWorkers.forEach(it => it.terminate());
            this.idleWorkers.splice(0, this.idleWorkers.length);
            if (this.numberOfWorkers === 0) {
                this.onTerminatePromise = Promise.resolve(undefined);
            } else {
                this.onTerminatePromise = new Promise<void>((resolve, _reject) => this.onTerminatedCallback = resolve);
            }
        }
        return this.onTerminatePromise;
    }

    private pushBackIdleWorker(worker: WorkerAdapter) {
        const waiting = this.waitingElements.shift();
        if (waiting == undefined) {
            if (this.shouldTerminate) {
                worker.terminate();
                --this.numberOfWorkers;
                if (this.numberOfWorkers === 0 && this.onTerminatedCallback != undefined) {
                    this.onTerminatedCallback();
                }
            } else {
                this.idleWorkers.push(worker);
            }
        } else {
            waiting.setNextFreeAdapter(worker);
        }
    }

    private waitForIdleWorker(): Promise<WorkerAdapter> {
        const ret = new WaitingElement();
        this.waitingElements.push(ret);
        return ret.promise;
    }
}