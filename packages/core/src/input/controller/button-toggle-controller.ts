import { ButtonController, InputController } from "../input-controller";
import { ButtonControllerJson, ButtonToggleControllerJson } from "../input-controller-json";
import { AbstractInputController } from "./abstract-input-controller";

export class ButtonToggleController extends AbstractInputController<boolean> {

    readonly description: string;
    readonly isButton = true;
    readonly requiresPolling: boolean;

    constructor(readonly button: ButtonController) {
        super(false);
        this.description = button.description;
        this.requiresPolling = button.requiresPolling;
        button.onChange.subscribe(this, value => {
            if (value) {
                this.setValue(!this.value);
            }
        });
    }

    override conflictsWith(other: InputController<number | boolean | {readonly x: number, readonly y: number}>): boolean {
        return this.button.conflictsWith(other);
    }

    override conflictsWithGamepadButton(gamepad: number, button: number): boolean {
        return this.button.conflictsWithGamepadButton(gamepad, button);
    }

    override conflictsWithKeyboard(code: string): boolean {
        return this.button.conflictsWithKeyboard(code);
    }

    override conflictsWithMouseButton(button: number): boolean {
        return this.button.conflictsWithMouseButton(button);
    }

    override conflictsWithMouseWheel(axis: "x" | "y" | "z"): boolean {
        return this.button.conflictsWithMouseWheel(axis);
    }

    override forGamepad(gamepad: number): InputController<boolean> {
        return new ButtonToggleController(this.button.forGamepad(gamepad) as ButtonController);
    }

    reset(): void {
        this.button.reset();
        this.setValue(false);
    }

    save(): ButtonControllerJson {
        const ret: ButtonToggleControllerJson = {
            type: 'toggle',
            button: this.button.save()
        };
        return ret;
    }

    protected override start(): void {
        this.button.setEnabledBy(this, true);
    }

    protected override stop(): void {
        this.button.setEnabledBy(this, false);
    }

    protected override updateValueFromPolling(): void {
        this.button.poll();
    }
}
