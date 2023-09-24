import { AxisInput } from "./axis-input";
import { ButtonInput } from "./button-input";
import { GamepadAxisInput } from "./gamepad-axis-input";
import { GamepadButtonAxisInput } from "./gamepad-button-axis-input";
import { GamepadButtonInput } from "./gamepad-button-input";
import { Gamepads } from "./gamepads";
import { KeyButtonInput } from "./key-button-input";
import { MouseButtonInput } from "./mouse-button-input";
import { MouseWheelButtonInput } from "./mouse-wheel-button-input";

export interface InputRecording {
    cancel(): void;
}

export class InputRecorder {

    static recordButton(callback: (input: ButtonInput) => void): InputRecording {
        const cancelCallback = () => {
            document.removeEventListener('mousedown', mouseCallback, { capture: true });
            document.removeEventListener('wheel', wheelCallback, { capture: true });
            document.removeEventListener('keydown', keyCallback, { capture: true });
            window.clearInterval(timer);
        };
        const mouseCallback = (ev: MouseEvent) => {
            ev.preventDefault();
            cancelCallback();
            callback(new MouseButtonInput(ev.button));
        };
        const wheelCallback = (ev: WheelEvent) => {
            ev.preventDefault();
            cancelCallback();
            if (Math.abs(ev.deltaX) > 0) {
                callback(new MouseWheelButtonInput('x', ev.deltaX / Math.abs(ev.deltaX)));
            } else if (Math.abs(ev.deltaY) > 0) {
                callback(new MouseWheelButtonInput('y', ev.deltaY / Math.abs(ev.deltaY)));
            } else if (Math.abs(ev.deltaZ) > 0) {
                callback(new MouseWheelButtonInput('z', ev.deltaZ / Math.abs(ev.deltaZ)));
            }
        };
        const keyCallback = (ev: KeyboardEvent) => {
            ev.preventDefault();
            cancelCallback();
            callback(new KeyButtonInput(ev.code));
        };
        document.addEventListener('mousedown', mouseCallback, { capture: true, passive: false });
        document.addEventListener('wheel', wheelCallback, { capture: true, passive: false });
        document.addEventListener('keydown', keyCallback, { capture: true, passive: false });
        const timer = window.setInterval(() => {
            for (let i = 0; i < Gamepads.size; ++i) {
                const g = Gamepads.get(i);
                if (g != undefined) {
                    const buttons = g.buttons;
                    for (let b = 0; b < buttons.length; ++b) {
                        if (buttons[b].pressed) {
                            cancelCallback();
                            callback(new GamepadButtonInput(i, b));
                            return;
                        }
                    }
                }
            }
        }, 1);
        return {
            cancel: cancelCallback
        };
    }

    static recordAxis(callback: (input: AxisInput) => void): InputRecording {
        const cancelCallback = () => {
            window.clearInterval(timer);
        };
        const timer = window.setInterval(() => {
            for (let i = 0; i < Gamepads.size; ++i) {
                const g = Gamepads.get(i);
                if (g != undefined) {
                    const axes = g.axes;
                    for (let a = 0; a < axes.length; ++a) {
                        if (Math.abs(axes[a]) > 0.1) {
                            cancelCallback();
                            callback(new GamepadAxisInput(i, a));
                            return;
                        }
                    }
                    const buttons = g.buttons;
                    for (let b = 0; b < buttons.length; ++b) {
                        if (Math.abs(buttons[b].value) > 0.1) {
                            cancelCallback();
                            callback(new GamepadButtonAxisInput(i, b));
                            return;
                        }
                    }
                }
            }
        }, 1);
        return {
            cancel: cancelCallback
        };
    }
}