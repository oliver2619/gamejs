import { EventObservable } from "../observable/event-observable";
import { Gamepads } from "./gamepads";
import { InputController } from "./input-controller";
import { InputFactory } from "./input-controller-factory";

export interface ButtonInputRecorderData {
    readonly mouse: boolean;
    readonly keyboard: boolean;
    readonly gamepad: boolean;
    readonly axisThreshold: number;
    readonly input?: HTMLInputElement;
    readonly initial?: InputController<boolean>;
    readonly filter?: (input: InputController<boolean>) => boolean;
}

export class ButtonInputRecorder {

    readonly onChange = new EventObservable<InputController<boolean>>();

    private readonly mouse: boolean;
    private readonly keyboard: boolean;
    private readonly gamepad: boolean;
    private readonly axisThreshold: number;
    private readonly input: HTMLInputElement | undefined;
    private readonly filter: (input: InputController<boolean>) => boolean;

    private timer: number | undefined;
    private recording = false;
    private current: InputController<boolean> | undefined;

    private readonly mouseCallback = (ev: MouseEvent) => {
        ev.preventDefault();
        this.change(InputFactory.mouseButton(ev.button))
    };
    private readonly wheelCallback = (ev: WheelEvent) => {
        ev.preventDefault();
        if (Math.abs(ev.deltaX) > 0) {
            this.change(InputFactory.mouseWheelAsButton('x', ev.deltaX / Math.abs(ev.deltaX)));
        } else if (Math.abs(ev.deltaY) > 0) {
            this.change(InputFactory.mouseWheelAsButton('y', ev.deltaY / Math.abs(ev.deltaY)));
        } else if (Math.abs(ev.deltaZ) > 0) {
            this.change(InputFactory.mouseWheelAsButton('z', ev.deltaZ / Math.abs(ev.deltaZ)));
        }
    };
    private readonly keyCallback = (ev: KeyboardEvent) => {
        ev.preventDefault();
        this.change(InputFactory.keyboard(ev.code));
    };
    private readonly timerCallback = () => {
        for (let i = 0; i < Gamepads.size; ++i) {
            const g = Gamepads.get(i);
            if (g != undefined) {
                const buttons = g.buttons;
                for (let b = 0; b < buttons.length; ++b) {
                    if (buttons[b]!.pressed) {
                        this.change(InputFactory.gamepadButton(i, b));
                        return;
                    }
                }
                const axes = g.axes;
                for (let a = 0; a < axes.length; ++a) {
                    if (Math.abs(axes[a]!) >= this.axisThreshold) {
                        this.change(InputFactory.gamepadAxisAsButton(i, a, axes[a]! < 0 ? -this.axisThreshold : this.axisThreshold));
                        return;
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

    constructor(data: ButtonInputRecorderData) {
        this.mouse = data.mouse;
        this.keyboard = data.keyboard;
        this.gamepad = data.gamepad;
        this.input = data.input;
        this.current = data.initial;
        this.filter = data.filter ?? (() => true);
        this.axisThreshold = data.axisThreshold;
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

    set(buttonInput: InputController<boolean>) {
        this.stop();
        this.current = buttonInput;
        this.updateInput();
    }

    start() {
        if (!this.recording) {
            this.recording = true;
            if (this.input == undefined) {
                if (this.mouse) {
                    document.addEventListener('mousedown', this.mouseCallback, { capture: true, passive: false });
                    document.addEventListener('wheel', this.wheelCallback, { capture: true, passive: false });
                }
                if (this.keyboard) {
                    document.addEventListener('keydown', this.keyCallback, { capture: true, passive: false });
                }
            } else {
                if (this.mouse) {
                    this.input.addEventListener('mousedown', this.mouseCallback, { capture: true, passive: false });
                    this.input.addEventListener('wheel', this.wheelCallback, { capture: true, passive: false });
                }
                if (this.keyboard) {
                    this.input.addEventListener('keydown', this.keyCallback, { capture: true, passive: false });
                }
                this.input.addEventListener('blur', this.blurCallback);
            }
            if (this.gamepad) {
                this.timer = window.setInterval(this.timerCallback, 1);
            }
            this.updateInput();
        }
    }

    private change(input: InputController<boolean>) {
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
            if (this.input == undefined) {
                if (this.mouse) {
                    document.removeEventListener('mousedown', this.mouseCallback, { capture: true });
                    document.removeEventListener('wheel', this.wheelCallback, { capture: true });
                }
                if (this.keyboard) {
                    document.removeEventListener('keydown', this.keyCallback, { capture: true });
                }
            } else {
                if (this.mouse) {
                    this.input.removeEventListener('mousedown', this.mouseCallback, { capture: true });
                    this.input.removeEventListener('wheel', this.wheelCallback, { capture: true });
                }
                if (this.keyboard) {
                    this.input.removeEventListener('keydown', this.keyCallback, { capture: true });
                }
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