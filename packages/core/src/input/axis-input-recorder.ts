import { EventObservable } from "../observable/event-observable";
import { Gamepads } from "./gamepads";
import { InputController } from "./input-controller";
import { InputFactory } from "./input-controller-factory";

export interface AxisInputRecorderData {
    readonly gamepad: boolean;
    readonly halfAxis?: boolean;
    readonly input?: HTMLInputElement;
    readonly initial?: InputController<number>;
    readonly filter?: (input: InputController<number>) => boolean;
}

export class AxisInputRecorder {

    readonly onChange = new EventObservable<InputController<number>>();

    private readonly gamepad: boolean;
    private readonly halfAxis: boolean;
    private readonly input: HTMLInputElement | undefined;
    private readonly filter: (input: InputController<number>) => boolean;

    private timer: number | undefined;
    private recording = false;
    private current: InputController<number> | undefined;

    private readonly keyCallback = (ev: KeyboardEvent) => {
        if (ev.code === 'Escape') {
            ev.preventDefault();
            this.cancel();
        }
    };
    private readonly timerCallback = () => {
        for (let i = 0; i < Gamepads.size; ++i) {
            const g = Gamepads.get(i);
            if (g != undefined) {
                const axes = g.axes;
                for (let a = 0; a < axes.length; ++a) {
                    if (Math.abs(axes[a]!) > 0.1) {
                        if (this.halfAxis) {
                            this.change(InputFactory.gamepadAxis(i, a, axes[a]! < 0 ? -1 : 1));
                        } else {
                            this.change(InputFactory.gamepadAxis(i, a));
                        }
                        return;
                    }
                }
                if (this.halfAxis) {
                    const buttons = g.buttons;
                    for (let b = 0; b < buttons.length; ++b) {
                        if (Math.abs(buttons[b]!.value) > 0.1) {
                            this.change(InputFactory.gamepadButtonAsAxis(i, b));
                            return;
                        }
                    }
                }
            }
        }
    };
    private readonly focusCallback = () => {
        this.start();
    };
    private readonly blurCallback = () => {
        this.cancel();
    };

    constructor(data: AxisInputRecorderData) {
        this.gamepad = data.gamepad;
        this.halfAxis = data.halfAxis ?? false;
        this.input = data.input;
        this.current = data.initial;
        this.filter = data.filter ?? (() => true);
        if (this.input != undefined) {
            this.input.addEventListener('focus', this.focusCallback);
        }
        this.updateInput();
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
        }
    }

    set(input: InputController<number>) {
        this.stop();
        this.current = input;
        this.updateInput();
    }

    start() {
        if (!this.recording) {
            this.recording = true;
            if (this.input != undefined) {
                this.input.addEventListener('keydown', this.keyCallback, { capture: true, passive: false });
                this.input.addEventListener('blur', this.blurCallback);
            }
            if (this.gamepad) {
                this.timer = window.setInterval(this.timerCallback, 1);
            }
            this.updateInput();
        }
    }

    private change(input: InputController<number>) {
        if (this.filter(input)) {
            this.stop();
            this.current = input;
            this.updateInput();
            this.onChange.next(input);
        }
    }

    private stop() {
        if (this.recording) {
            this.recording = false;
            if (this.input != undefined) {
                this.input.removeEventListener('keydown', this.keyCallback, { capture: true });
                this.input.removeEventListener('blur', this.blurCallback);
            }
            if (this.timer != undefined) {
                window.clearInterval(this.timer);
                this.timer = undefined;
            }
            if (this.input != undefined) {
                this.input.blur();
            }
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