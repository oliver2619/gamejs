import { ButtonToggleController } from "./controller/button-toggle-controller";
import { ComplementaryButtonsAsAxisController } from "./controller/complementary-buttons-as-axis-controller";
import { GamepadAxisAsButtonController } from "./controller/gamepad-axis-as-button-controller";
import { GamepadAxisController } from "./controller/gamepad-axis-controller";
import { GamepadButtonAsAxisController } from "./controller/gamepad-button-as-axis-controller";
import { GamepadButtonController } from "./controller/gamepad-button-controller";
import { KeyboardController } from "./controller/keyboard-controller";
import { MouseButtonController } from "./controller/mouse-button-controller";
import { MouseWheelAsButtonController } from "./controller/mouse-wheel-as-button-controller";
import { AxisController, ButtonController, InputController } from "./input-controller";
import { ButtonToggleControllerJson, ComplementaryButtonsAsAxisControllerJson, GamepadAxisAsButtonControllerJson, GamepadAxisControllerJson, GamepadButtonAsAxisControllerJson, GamepadButtonControllerJson, InputControllerJson, KeyboardControllerJson, MouseControllerJson, MouseWheelControllerJson } from "./input-controller-json";

export class InputFactory {

    private constructor() { }

    static gamepadButtonAsAxis(gamepadIndex: number, button: number): AxisController {
        return new GamepadButtonAsAxisController(gamepadIndex, button);
    }

    static gamepadButton(gamepadIndex: number, button: number): ButtonController {
        return new GamepadButtonController(gamepadIndex, button);
    }

    static gamepadAxis(gamepadIndex: number, axis: number, directionFilter?: number): AxisController {
        return new GamepadAxisController(gamepadIndex, axis, directionFilter);
    }

    static gamepadAxisAsButton(gamepadIndex: number, axis: number, threshold: number): ButtonController {
        return new GamepadAxisAsButtonController(gamepadIndex, axis, threshold);
    }

    static keyboard(code: string): ButtonController {
        return new KeyboardController(code);
    }

    static load(json: InputControllerJson): InputController<number | boolean> {
        switch (json.type) {
            case 'gamepadAxis':
                return this.loadGamepadAxis(json as GamepadAxisControllerJson);
            case 'gamepadButton':
                return this.loadGamepadButton(json as GamepadButtonControllerJson);
            case 'gamepadButtonAxis':
                return this.loadGamepadButtonAxis(json as GamepadButtonAsAxisControllerJson);
            case 'gamepadAxisButton':
                return this.loadGamepadAxisButton(json as GamepadAxisAsButtonControllerJson);
            case 'keyboard':
                return this.loadKeyboard(json as KeyboardControllerJson);
            case 'mouse':
                return this.loadMouse(json as MouseControllerJson);
            case 'mouseWheel':
                return this.loadMouseWheel(json as MouseWheelControllerJson);
            case 'toggle':
                return this.loadToggle(json as ButtonToggleControllerJson);
            case 'twoButtons':
                return this.loadTwoButtons(json as ComplementaryButtonsAsAxisControllerJson);
        }
    }

    static mouseButton(button: number): ButtonController {
        return new MouseButtonController(button);
    }

    static mouseWheelAsButton(axis: 'x' | 'y' | 'z', direction: number): ButtonController {
        return new MouseWheelAsButtonController(axis, direction);
    }

    static toggle(input: ButtonController): ButtonController {
        return new ButtonToggleController(input);
    }

    static twoButtonsAsAxis(buttonDown: ButtonController, buttonUp: ButtonController): AxisController {
        return new ComplementaryButtonsAsAxisController(buttonDown, buttonUp);
    }

    private static loadButton(json: InputControllerJson): ButtonController {
        switch (json.type) {
            case 'gamepadButton':
                return this.loadGamepadButton(json as GamepadButtonControllerJson);
            case 'gamepadAxisButton':
                return this.loadGamepadAxisButton(json as GamepadAxisAsButtonControllerJson);
            case 'keyboard':
                return this.loadKeyboard(json as KeyboardControllerJson);
            case 'mouse':
                return this.loadMouse(json as MouseControllerJson);
            case 'mouseWheel':
                return this.loadMouseWheel(json as MouseWheelControllerJson);
            case 'toggle':
                return this.loadToggle(json as ButtonToggleControllerJson);
            case 'gamepadAxis':
            case 'gamepadButtonAxis':
            case 'twoButtons':
                throw new RangeError(`Expected input type button and not axis.`);
        }
    }

    private static loadGamepadAxis(json: GamepadAxisControllerJson): AxisController {
        return this.gamepadAxis(json.gamepad, json.axis, json.direction);
    }

    private static loadGamepadAxisButton(json: GamepadAxisAsButtonControllerJson): ButtonController {
        return this.gamepadAxisAsButton(json.gamepad, json.axis, json.threshold);
    }

    private static loadGamepadButton(json: GamepadButtonControllerJson): ButtonController {
        return this.gamepadButton(json.gamepad, json.button);
    }

    private static loadGamepadButtonAxis(json: GamepadButtonAsAxisControllerJson): AxisController {
        return this.gamepadButtonAsAxis(json.gamepad, json.button);
    }

    private static loadKeyboard(json: KeyboardControllerJson): ButtonController {
        return this.keyboard(json.code);
    }

    private static loadMouse(json: MouseControllerJson): ButtonController {
        return this.mouseButton(json.button);
    }

    private static loadMouseWheel(json: MouseWheelControllerJson): ButtonController {
        return this.mouseWheelAsButton(json.axis, json.direction);
    }

    private static loadToggle(json: ButtonToggleControllerJson): ButtonController {
        return this.toggle(this.loadButton(json.button));
    }

    private static loadTwoButtons(json: ComplementaryButtonsAsAxisControllerJson): AxisController {
        return this.twoButtonsAsAxis(this.loadButton(json.down), this.loadButton(json.up));
    }

}