import { EventObservable, Observable, ObservableValue } from "../observable";
import { GamepadButtonEvent } from "./gamepad-button-event";
import { GamepadConstants } from "./gamepad-constants";
import { GamepadEventLoop } from "./gamepad-event-loop";
import { InputController } from "./input-controller";

export interface InputRecorderData<V extends number | boolean> {
    readonly input?: HTMLInputElement;
    readonly initial?: InputController<V>;
    readonly filter?: (input: InputController<V>) => boolean;
}

export abstract class InputRecorder<V extends number | boolean> {

    private static readonly _onRecordAny = new ObservableValue<InputRecorder<any> | undefined>(undefined);

    protected readonly _onChange = new EventObservable<InputController<V>>();
    protected readonly _onRecord = new EventObservable<boolean>();
    private readonly filter: (input: InputController<V>) => boolean;

    private input: HTMLInputElement | undefined;
    private recording = false;
    private current: InputController<V> | undefined;

    private readonly focusCallback = () => {
        queueMicrotask(() => this.start());
    };
    private readonly blurCallback = () => {
        queueMicrotask(() => this.cancel());
    };
    private readonly keyCallback = (ev: KeyboardEvent) => {
        ev.preventDefault();
        if (ev.code === 'Escape') {
            queueMicrotask(() => this.cancel());
        } else {
            queueMicrotask(() => this.onKeyDown(ev.code));
        }
    };
    private readonly mouseCallback = (ev: MouseEvent) => {
        ev.preventDefault();
        queueMicrotask(() => this.onMouseDown(ev.button));
    };
    private readonly wheelCallback = (ev: WheelEvent) => {
        ev.preventDefault();
        if (Math.abs(ev.deltaX) > 0) {
            queueMicrotask(() => this.onMouseWheel('x', ev.deltaX / Math.abs(ev.deltaX)));
        } else if (Math.abs(ev.deltaY) > 0) {
            queueMicrotask(() => this.onMouseWheel('y', ev.deltaY / Math.abs(ev.deltaY)));
        } else if (Math.abs(ev.deltaZ) > 0) {
            queueMicrotask(() => this.onMouseWheel('z', ev.deltaZ / Math.abs(ev.deltaZ)));
        }
    };

    static get active(): InputRecorder<number | boolean> | undefined {
        return this._onRecordAny.value;
    }

    static get onRecordAny(): Observable<InputRecorder<number | boolean> | undefined> {
        return this._onRecordAny;
    }

    get onChange(): Observable<InputController<V>> {
        return this._onChange;
    }

    get onRecord(): Observable<boolean> {
        return this._onRecord;
    }

    constructor(data: InputRecorderData<V>) {
        this.input = data.input;
        this.current = data.initial;
        this.filter = data.filter ?? (() => true);
        if (this.input != undefined) {
            this.input.addEventListener('focus', this.focusCallback);
        }
        this.updateInput();
    }

    attachInput(input: HTMLInputElement) {
        this.cancel();
        if (this.input != undefined) {
            this.input.removeEventListener('focus', this.focusCallback);
        }
        this.input = input;
        this.updateInput();
        this.input.addEventListener('focus', this.focusCallback);
    }

    cancel() {
        this.stop();
        this.updateInput();
    }

    clear() {
        this.stop();
        this.current = undefined;
        this.updateInput();
    }

    detachInput() {
        this.cancel();
        if (this.input != undefined) {
            this.input.removeEventListener('focus', this.focusCallback);
            this.input = undefined;
        }
    }

    set(input: InputController<V>) {
        this.stop();
        this.current = input;
        this.updateInput();
    }

    start() {
        if (!this.recording) {
            if (InputRecorder._onRecordAny.value != undefined) {
                InputRecorder._onRecordAny.value.cancel();
            }
            this.recording = true;
            InputRecorder._onRecordAny.value = this;
            if (this.input == undefined) {
                document.addEventListener('keydown', this.keyCallback, { capture: true, passive: false });
                document.addEventListener('mousedown', this.mouseCallback, { capture: true, passive: false });
                document.addEventListener('wheel', this.wheelCallback, { capture: true, passive: false });
            } else {
                this.input.addEventListener('blur', this.blurCallback);
                this.input.addEventListener('keydown', this.keyCallback, { capture: true, passive: false });
                this.input.addEventListener('mousedown', this.mouseCallback, { capture: true, passive: false });
                this.input.addEventListener('wheel', this.wheelCallback, { capture: true, passive: false });
            }
            GamepadEventLoop.onButtonUp.subscribe(this, (ev: GamepadButtonEvent) => {
                if (ev.button === GamepadConstants.BUTTON_BACK) {
                    this.cancel();
                } else {
                    this.onGamepadButton(ev);
                }
            });
            GamepadEventLoop.onPoll.subscribe(this, () => this.onPoll());
            this.updateInput();
            this._onRecord.next(true);
        }
    }

    protected change(input: InputController<V>) {
        if (this.filter(input)) {
            this.stop();
            this.current = input;
            this.updateInput();
            this._onChange.next(input);
        }
    }

    protected onKeyDown(_code: string) { }
    protected onMouseDown(_button: number) { }
    protected onMouseWheel(_wheel: 'x' | 'y' | 'z', _direction: number) { }
    protected onGamepadButton(_ev: GamepadButtonEvent) { }
    protected onPoll() { }

    private stop() {
        if (this.recording) {
            this.recording = false;
            if (InputRecorder._onRecordAny.value === this) {
                InputRecorder._onRecordAny.value = undefined;
            }
            if (this.input == undefined) {
                document.removeEventListener('keydown', this.keyCallback, { capture: true });
                document.removeEventListener('mousedown', this.mouseCallback, { capture: true });
                document.removeEventListener('wheel', this.wheelCallback, { capture: true });
            } else {
                this.input.removeEventListener('blur', this.blurCallback);
                this.input.removeEventListener('keydown', this.keyCallback, { capture: true });
                this.input.removeEventListener('mousedown', this.mouseCallback, { capture: true });
                this.input.removeEventListener('wheel', this.wheelCallback, { capture: true });
                this.input.blur();
            }
            GamepadEventLoop.onButtonUp.unsubscribe(this);
            GamepadEventLoop.onPoll.unsubscribe(this);
            this._onRecord.next(false);
        }
    }

    private updateInput() {
        if (this.input != undefined) {
            if (this.current == undefined || this.recording) {
                this.input.value = '';
            } else {
                this.input.value = this.current.description;
            }
        }
    }

}