import { EventObservable } from "../event/event-observable";

export abstract class Input<V> {

    readonly onChange = new EventObservable<V>();

    abstract readonly needsStateCheck: boolean;

    abstract readonly value: V;

    private readonly enabledBy = new Set<any>();

    checkState() {
        if (this.enabledBy.size > 0) {
            this.readValue();
        }
    }

    isEnabledBy(holder: any): boolean {
        return this.enabledBy.has(holder);
    }

    abstract reset(): void;

    setEnabledBy(holder: any, enabled: boolean) {
        const wasEnabled = this.enabledBy.size > 0;
        if (enabled) {
            this.enabledBy.add(holder);
        } else {
            this.enabledBy.delete(holder);
        }
        const isEnabled = this.enabledBy.size > 0;
        if (isEnabled && !wasEnabled) {
            this.start();
        } else if (!isEnabled && wasEnabled) {
            this.stop();
            this.reset();
        }
    }

    protected start() { }

    protected stop() { }

    protected readValue() { }
}