import { Observable } from "../observable/observable";
import { AxisControllerJson, ButtonControllerJson, GamepadDualAxesControllerJson, InputControllerJson } from "./input-controller-json";

export interface InputController<V extends number | boolean | {readonly x: number, readonly y: number}> {
    readonly isEnabled: boolean;
    readonly isButton: boolean;
    readonly description: string;
    readonly onChange: Observable<V>;
    readonly requiresPolling: boolean;
    readonly value: V;
    conflictsWith(other: InputController<number | boolean | {readonly x: number, readonly y: number}>): boolean;
    conflictsWithGamepadAxis(gamepad: number, axis: number, direction?: number): boolean;
    conflictsWithGamepadButton(gamepad: number, button: number): boolean;
    conflictsWithKeyboard(code: string): boolean;
    conflictsWithMouseButton(button: number): boolean;
    conflictsWithMouseWheel(axis: 'x' | 'y' | 'z'): boolean;
    forGamepad(gamepad: number): InputController<V>;
    poll(): void;
    reset(): void;
    save(): InputControllerJson;
    setEnabledBy(holder: any, enabled: boolean): void;
}

export interface ButtonController extends InputController<boolean> {
    save(): ButtonControllerJson;
}

export interface AxisController extends InputController<number> {
    save(): AxisControllerJson;
}

export interface DualAxesController extends InputController<{readonly x: number, readonly y: number}> {
    save(): GamepadDualAxesControllerJson;
}