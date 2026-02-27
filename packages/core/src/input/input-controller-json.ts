export interface InputSetJson {
    readonly apiVersion: 1;
    readonly clientVersion: number;
    readonly bindings: { readonly [key: string]: ReadonlyArray<InputControllerJson> };
}

export interface InputControllerJson {
    readonly type: 'gamepadAxis' | 'gamepadDualAxes' | 'gamepadButton' | 'gamepadButtonAxis' | 'gamepadAxisButton' | 'keyboard' | 'mouse' | 'mouseWheel' | 'toggle' | 'twoButtons';
}

export interface ButtonControllerJson extends InputControllerJson {
    readonly type: 'gamepadButton' | 'gamepadAxisButton' | 'keyboard' | 'mouse' | 'mouseWheel' | 'toggle';
}

export interface AxisControllerJson extends InputControllerJson {
    readonly type: 'gamepadAxis' | 'gamepadButtonAxis' | 'twoButtons';
}

export interface GamepadAxisControllerJson extends AxisControllerJson {
    readonly type: 'gamepadAxis';
    readonly gamepad: number;
    readonly axis: number;
    readonly direction: number | undefined;
}

export interface GamepadDualAxesControllerJson extends InputControllerJson {
    readonly type: 'gamepadDualAxes';
    readonly gamepad: number;
    readonly axis: number;
}

export interface GamepadButtonControllerJson extends ButtonControllerJson {
    readonly type: 'gamepadButton';
    readonly gamepad: number;
    readonly button: number;
}

export interface GamepadButtonAsAxisControllerJson extends AxisControllerJson {
    readonly type: 'gamepadButtonAxis';
    readonly gamepad: number;
    readonly button: number;
}

export interface GamepadAxisAsButtonControllerJson extends ButtonControllerJson {
    readonly type: 'gamepadAxisButton';
    readonly gamepad: number;
    readonly axis: number;
    readonly threshold: number;
}

export interface KeyboardControllerJson extends ButtonControllerJson {
    readonly type: 'keyboard';
    readonly code: string;
}

export interface MouseControllerJson extends ButtonControllerJson {
    readonly type: 'mouse';
    readonly button: number;
}

export interface MouseWheelControllerJson extends ButtonControllerJson {
    readonly type: 'mouseWheel';
    readonly axis: 'x' | 'y' | 'z';
    readonly direction: number;
}

export interface ButtonToggleControllerJson extends ButtonControllerJson {
    readonly type: 'toggle';
    readonly button: ButtonControllerJson;
}

export interface ComplementaryButtonsAsAxisControllerJson extends AxisControllerJson {
    readonly type: 'twoButtons';
    readonly down: ButtonControllerJson;
    readonly up: ButtonControllerJson;
}
