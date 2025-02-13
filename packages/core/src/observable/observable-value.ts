import { Observable } from "./observable";

export class ObservableValue<T> implements Observable<T> {

    private readonly callbacksByObserver = new Map<any, (value: T) => void>();

    get value(): T {
        return this._value;
    }

    set value(value: T) {
        if (this._value !== value) {
            this._value = value;
            this.callbacksByObserver.forEach((callback, _) => callback(value));
        }
    }

    constructor(private _value: T) { }

    subscribe(observer: any, callback: (value: T) => void): void {
        this.callbacksByObserver.set(observer, callback);
        callback(this._value);
    }

    unsubscribe(observer: any): void {
        this.callbacksByObserver.delete(observer);
    }
}