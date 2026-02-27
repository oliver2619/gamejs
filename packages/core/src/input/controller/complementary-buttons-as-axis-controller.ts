import { ButtonController, InputController } from "../input-controller";
import { AxisControllerJson, ComplementaryButtonsAsAxisControllerJson } from "../input-controller-json";
import { AbstractInputController } from "./abstract-input-controller";

export class ComplementaryButtonsAsAxisController extends AbstractInputController<number> {

    readonly description: string;
    readonly isButton = false;
    readonly requiresPolling: boolean;

    private onButtonsValueChange = () => {
        this.setValue((this.buttonUp.value ? 1 : 0) - (this.buttonDown.value ? 1 : 0));
    };

    constructor(readonly buttonDown: ButtonController, readonly buttonUp: ButtonController) {
        super(0);
        this.description = `${this.buttonDown.description} - ${this.buttonUp.description}`;
        this.requiresPolling = this.buttonDown.requiresPolling || this.buttonUp.requiresPolling;
        buttonDown.onChange.subscribe(this, this.onButtonsValueChange);
        buttonUp.onChange.subscribe(this, this.onButtonsValueChange);
    }

    conflictsWith(other: InputController<number | boolean | { readonly x: number, readonly y: number }>): boolean {
        return this.buttonDown.conflictsWith(other) || this.buttonUp.conflictsWith(other);
    }

    override conflictsWithGamepadButton(gamepad: number, button: number): boolean {
        return this.buttonDown.conflictsWithGamepadButton(gamepad, button) || this.buttonUp.conflictsWithGamepadButton(gamepad, button);
    }

    override conflictsWithKeyboard(code: string): boolean {
        return this.buttonDown.conflictsWithKeyboard(code) || this.buttonUp.conflictsWithKeyboard(code);
    }

    override conflictsWithMouseButton(button: number): boolean {
        return this.buttonDown.conflictsWithMouseButton(button) || this.buttonUp.conflictsWithMouseButton(button);
    }

    override conflictsWithMouseWheel(axis: "x" | "y" | "z"): boolean {
        return this.buttonDown.conflictsWithMouseWheel(axis) || this.buttonUp.conflictsWithMouseWheel(axis);
    }

    override forGamepad(gamepad: number): InputController<number> {
        return new ComplementaryButtonsAsAxisController(this.buttonDown.forGamepad(gamepad) as ButtonController, this.buttonUp.forGamepad(gamepad) as ButtonController);
    }

    save(): AxisControllerJson {
        const ret: ComplementaryButtonsAsAxisControllerJson = {
            type: 'twoButtons',
            down: this.buttonDown.save(),
            up: this.buttonUp.save()
        };
        return ret;
    }

    reset(): void {
        this.buttonDown.reset();
        this.buttonUp.reset();
    }

    protected override start(): void {
        this.buttonDown.setEnabledBy(this, true);
        this.buttonUp.setEnabledBy(this, true);
    }

    protected override stop(): void {
        this.buttonDown.setEnabledBy(this, false);
        this.buttonUp.setEnabledBy(this, false);
    }

    protected override updateValueFromPolling(): void {
        this.buttonDown.poll();
        this.buttonUp.poll();
    }
}

