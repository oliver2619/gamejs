import { Observable } from "./observable";

export class EventObservable<T> implements Observable<T> {

    private readonly callbacksByObserver = new Map<any, (value: T) => void>();
    private readonly onceCallbacks: Array<(value: T) => void> = [];

    get hasSubscriptions(): boolean {
        return this.callbacksByObserver.size > 0 || this.onceCallbacks.length > 0;
    }

    constructor(private readonly onSubscriptionsChange?: (hasSubscriptions: boolean) => void) { }

    next(value: T) {
        const cnt1 = this.callbacksByObserver.size + this.onceCallbacks.length;
        this.callbacksByObserver.forEach((callback, _observer) => callback(value));
        const cbs = this.onceCallbacks.slice(0);
        this.onceCallbacks.splice(0, this.onceCallbacks.length);
        cbs.forEach(it => it(value));
        const cnt2 = this.callbacksByObserver.size + this.onceCallbacks.length;
        if (cnt1 > 0 && cnt2 === 0 && this.onSubscriptionsChange != undefined) {
            this.onSubscriptionsChange(false);
        }
    }

    subscribe(observer: any, callback: (value: T) => void): void {
        this.callbacksByObserver.set(observer, callback);
        if (this.callbacksByObserver.size + this.onceCallbacks.length === 1 && this.onSubscriptionsChange != undefined) {
            this.onSubscriptionsChange(true);
        }
    }

    subscribeOnce(callback: (value: T) => void) {
        this.onceCallbacks.push(callback);
        if (this.callbacksByObserver.size + this.onceCallbacks.length === 1 && this.onSubscriptionsChange != undefined) {
            this.onSubscriptionsChange(true);
        }
    }

    unsubscribe(observer: any): void {
        if (!this.callbacksByObserver.delete(observer)) {
            throw new Error(`Observer ${observer} did not subscribe.`);
        }
        if (this.callbacksByObserver.size + this.onceCallbacks.length === 0 && this.onSubscriptionsChange != undefined) {
            this.onSubscriptionsChange(false);
        }
    }
}