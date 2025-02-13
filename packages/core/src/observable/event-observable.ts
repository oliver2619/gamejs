import { Observable } from "./observable";

export class EventObservable<T> implements Observable<T> {

    private readonly callbacksByObserver = new Map<any, (value: T) => void>();

    get hasSubscriptions(): boolean {
        return this.callbacksByObserver.size > 0;
    }

    constructor(private onSubscriptionsChange?: (hasSubscriptions: boolean) => void) { }

    next(value: T) {
        this.callbacksByObserver.forEach((callback, _) => callback(value));
    }

    subscribe(observer: any, callback: (value: T) => void): void {
        this.callbacksByObserver.set(observer, callback);
        if (this.callbacksByObserver.size === 1 && this.onSubscriptionsChange != undefined) {
            this.onSubscriptionsChange(true);
        }
    }

    unsubscribe(observer: any): void {
        if (!this.callbacksByObserver.delete(observer)) {
            throw new Error(`Observer ${observer} did not subscribe.`)
        }
        if (this.callbacksByObserver.size === 0 && this.onSubscriptionsChange != undefined) {
            this.onSubscriptionsChange(false);
        }
    }
}