import {EventSubscription} from "./event-subscription";

class BaseEventSubscription implements EventSubscription {

    protected constructor(private readonly onUnsubscribe: (subscription: EventSubscription) => void) {
    }

    and(other: EventSubscription) {
        const fn = (_: EventSubscription) => {
            this.onUnsubscribe(this);
            other.unsubscribe();
        }
        return new BaseEventSubscription(fn);
    }

    unsubscribe() {
        this.onUnsubscribe(this);
    }
}

class EventSubscriptionImp<E> extends BaseEventSubscription {

    constructor(onUnsubscribe: (subscription: EventSubscription) => void, private readonly callback: (event: E) => void, private once: boolean) {
        super(onUnsubscribe);
    }

    call(event: E) {
        this.callback(event);
        if (this.once) {
            this.unsubscribe();
        }
    }
}

export class EventObservable<E> {

    private readonly subscriptions: EventSubscriptionImp<E>[] = [];
    private readonly unsubscribeQueue: EventSubscription[] = [];

    private isProducing = false;

    subscribe(callback: (event: E) => void): EventSubscription {
        const ret = new EventSubscriptionImp<E>(subscription => this.unsubscribe(subscription), callback, false);
        this.subscriptions.push(ret);
        return ret;
    }

    subscribeOnce(callback: (event: E) => void): EventSubscription {
        const ret = new EventSubscriptionImp<E>(subscription => this.unsubscribe(subscription), callback, true);
        this.subscriptions.push(ret);
        return ret;
    }

    produce(event: E) {
        if (!this.isProducing) {
            this.isProducing = true;
            let exceptions = 0;
            this.subscriptions.forEach(it => {
                try {
                    it.call(event);
                } catch (e) {
                    ++exceptions;
                    console.error(e);
                }
            });
            this.isProducing = false;
            this.unsubscribeQueue.forEach(it => this.unsubscribe(it));
            if (exceptions > 0) {
                throw new Error(`${exceptions} exceptions occurred`);
            }
        }
    }

    private unsubscribe(subscription: EventSubscription) {
        if (this.isProducing) {
            this.unsubscribeQueue.push(subscription);
        } else {
            const found = this.subscriptions.findIndex(it => it === subscription);
            if (found >= 0) {
                this.subscriptions.splice(found, 1);
            }
        }
    }
}