export interface Observable<T> {
    subscribe(observer: any, callback: (value: T) => void): void;
    subscribeOnce(callback: (value: T) => void): void;
    unsubscribe(observer: any): void;
}
