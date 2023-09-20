export interface EventSubscription {

    and(other: EventSubscription): EventSubscription;

    unsubscribe(): void;
}