import { EventObservable } from "../observable";
import { Observable } from "../observable/observable";
import { InputController } from "./input-controller";
import { InputControllerFactory } from "./input-controller-factory";
import { InputControllerJson, InputSetJson } from "./input-controller-json";
import { KeyboardLock } from "./keyboard-lock";

class InputSetEntry<T extends number | boolean | { readonly x: number, readonly y: number }> {

    private readonly pollingBasedInputs: InputController<T>[] = [];
    private readonly eventDrivenInputs: InputController<T>[] = [];
    private readonly isButton: boolean;

    get isEmpty(): boolean {
        return this.pollingBasedInputs.length === 0 && this.eventDrivenInputs.length === 0;
    }

    constructor(input: InputController<T>) {
        this.isButton = input.isButton;
        this.add(input);
    }

    add(input: InputController<T>) {
        if (input.isButton !== this.isButton) {
            throw new RangeError('Mix of buttons and axis are not allowed in input set.');
        }
        if (!this.isButton && (this.pollingBasedInputs.length > 0 || this.eventDrivenInputs.length > 0)) {
            throw new Error('Multiple axes for one action are not allowed.');
        }
        if (input.requiresPolling) {
            this.pollingBasedInputs.push(input);
        } else {
            this.eventDrivenInputs.push(input);
        }
    }

    getValue(): T {
        if (this.isButton) {
            return (this.pollingBasedInputs.some(it => it.value === true) || this.eventDrivenInputs.some(it => it.value === true)) as T;
        } else {
            if (this.pollingBasedInputs.length > 0) {
                return this.pollingBasedInputs[0]!.value;
            } else {
                return this.eventDrivenInputs[0]!.value;
            }
        }
    }

    forEach(callback: (input: InputController<T>) => void) {
        this.pollingBasedInputs.forEach(callback);
        this.eventDrivenInputs.forEach(callback);
    }

    poll() {
        this.pollingBasedInputs.forEach(it => it.poll());
    }

    reset() {
        this.pollingBasedInputs.forEach(it => it.reset());
        this.eventDrivenInputs.forEach(it => it.reset());
    }

    save(): InputControllerJson[] {
        return [...this.pollingBasedInputs.map(it => it.save()), ...this.eventDrivenInputs.map(it => it.save())];
    }

    setEnabledBy(holder: any, enabled: boolean) {
        this.pollingBasedInputs.forEach(it => it.setEnabledBy(holder, enabled));
        this.eventDrivenInputs.forEach(it => it.setEnabledBy(holder, enabled));
    }

    remove(input: InputController<T>) {
        if (input.requiresPolling) {
            const i = this.pollingBasedInputs.indexOf(input);
            if (i >= 0) {
                this.pollingBasedInputs.splice(i, 1);
            }
        } else {
            const i = this.eventDrivenInputs.indexOf(input);
            if (i >= 0) {
                this.eventDrivenInputs.splice(i, 1);
            }
        }
    }
}

export class InputSet<S extends { [K in keyof S]: number | boolean | { readonly x: number, readonly y: number } }> {

    private inputsByBinding: Partial<{ [K in keyof S]: InputSetEntry<S[K]> }> = {};
    private readonly enabledBy = new Set<any>();
    private readonly observablesByBinding: Partial<{ [K in keyof S]: EventObservable<S[K]> }> = {};

    private _state: S = {} as S;

    get state(): Readonly<S> {
        return this._state;
    }

    bind<K extends keyof S, T extends S[K]>(binding: K, input: InputController<T>) {
        this.registerInput(binding, input);
        const entry = this.inputsByBinding[binding];
        if (entry == undefined) {
            const newEntry = new InputSetEntry(input);
            this.inputsByBinding[binding] = newEntry;
        } else {
            entry.add(input);
        }
    }

    clearBindings() {
        for (let k in this.inputsByBinding) {
            this.inputsByBinding[k]!.forEach(it => this.unregisterInput(it));
        }
        this.inputsByBinding = {} as { [K in keyof S]: InputSetEntry<S[K]> };
    }

    forEach(callback: (input: InputController<number | boolean | { readonly x: number, readonly y: number }>) => void) {
        for (let k in this.inputsByBinding) {
            this.inputsByBinding[k]!.forEach(callback);
        }
    }

    load(json: InputSetJson) {
        this.clearBindings();
        Object.entries(json.bindings).forEach(([key, bindings]) => {
            bindings.forEach(it => {
                this.bind(key as keyof S, InputControllerFactory.load(it) as InputController<S[keyof S]>);
            });
        });
    }

    onChange<K extends keyof S>(binding: K): Observable<S[K]> {
        const obs = this.observablesByBinding[binding];
        if (obs == undefined) {
            const newObs = new EventObservable<S[K]>((hasSubscriptions) => {
                if (!hasSubscriptions) {
                    delete this.observablesByBinding[binding];
                }
            });
            this.observablesByBinding[binding] = newObs;
            return newObs;
        } else {
            return obs;
        }
    }

    poll() {
        for (let k in this.inputsByBinding) {
            this.inputsByBinding[k]!.poll();
        }
    }

    reset() {
        for (let k in this.inputsByBinding) {
            this.inputsByBinding[k]!.reset();
        }
    }

    save(clientVersion: number): InputSetJson {
        const bindings: Partial<{ [K in keyof S]: Array<InputControllerJson> }> = {};
        for (let k in this.inputsByBinding) {
            bindings[k] = this.inputsByBinding[k]!.save();
        }
        return {
            apiVersion: 1,
            clientVersion,
            bindings: bindings as { [key: string]: Array<InputControllerJson> }
        }
    }

    setEnabledBy(holder: any, enabled: boolean) {
        const wasEnabled = this.enabledBy.size > 0;
        if (enabled) {
            this.enabledBy.add(holder);
        } else {
            this.enabledBy.delete(holder);
        }
        const isEnabled = this.enabledBy.size > 0;
        if (wasEnabled !== isEnabled) {
            for (let k in this.inputsByBinding) {
                this.inputsByBinding[k]!.setEnabledBy(this, isEnabled);
            }
            if (isEnabled) {
                KeyboardLock.lock(this);
            } else {
                KeyboardLock.unlock(this);
            }
        }
    }

    unbind<K extends keyof S>(binding: K, input: InputController<S[K]>) {
        const inputs = this.inputsByBinding[binding];
        if (inputs != undefined) {
            inputs.remove(input);
            this.unregisterInput(input);
            if (inputs.isEmpty) {
                delete this.inputsByBinding[binding];
            }
        }
    }

    unbindAll(binding: keyof S) {
        const inputs = this.inputsByBinding[binding];
        if (inputs != undefined) {
            inputs.forEach(it => this.unregisterInput(it));
            delete this.inputsByBinding[binding];
        }
    }

    private registerInput(binding: keyof S, input: InputController<number | boolean | { readonly x: number, readonly y: number }>) {
        input.setEnabledBy(this, this.enabledBy.size > 0);
        input.onChange.subscribe(this, () => {
            const value = this.inputsByBinding[binding]!.getValue();
            (this._state as any)[binding] = value;
            const obs = this.observablesByBinding[binding];
            if (obs != undefined) {
                obs.next(value);
            }
        });
    }

    private unregisterInput(input: InputController<number | boolean | { readonly x: number, readonly y: number }>) {
        input.reset();
        input.setEnabledBy(this, false);
        input.onChange.unsubscribe(this);
    }
}
