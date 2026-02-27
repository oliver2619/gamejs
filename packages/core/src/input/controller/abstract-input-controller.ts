import { EventObservable } from "../../observable/event-observable";
import { Observable } from "../../observable/observable";
import { InputController } from "../input-controller";
import { InputControllerJson } from "../input-controller-json";

export abstract class AbstractInputController<V extends boolean | number | { readonly x: number, readonly y: number }> implements InputController<V> {

    abstract readonly description: string;
    abstract readonly isButton: boolean;
    abstract readonly requiresPolling: boolean;

    private _onChange = new EventObservable<V>();
    private readonly enabledBy = new Set<any>();

    get isEnabled(): boolean {
        return this.enabledBy.size > 0;
    }

    get onChange(): Observable<V> {
        return this._onChange;
    }

    get value(): V {
        return this._value;
    }

    protected constructor(private _value: V) { }

    abstract conflictsWith(other: InputController<number | boolean | { readonly x: number, readonly y: number }>): boolean;

    conflictsWithGamepadAxis(_1: number, _2: number, _3?: number): boolean {
        return false;
    }

    conflictsWithGamepadButton(_1: number, _2: number): boolean {
        return false;
    }

    conflictsWithKeyboard(_: string): boolean {
        return false;
    }

    conflictsWithMouseButton(_: number): boolean {
        return false;
    }

    conflictsWithMouseWheel(_: 'x' | 'y' | 'z'): boolean {
        return false;
    }

    abstract forGamepad(gamepad: number): InputController<V>;

    poll() {
        if (this.enabledBy.size > 0) {
            this.updateValueFromPolling();
        }
    }

    abstract save(): InputControllerJson;

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

    protected setValue(v: V) {
        if (this._value !== v) {
            this._value = v;
            this._onChange.next(v);
        }
    }

    protected start() { }

    protected stop() { }

    protected updateValueFromPolling() { }
}

