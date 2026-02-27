import { ButtonController, InputController } from "../input-controller";
import { ButtonControllerJson } from "../input-controller-json";
import { AbstractInputController } from "./abstract-input-controller";

export abstract class AbstractButtonController extends AbstractInputController<boolean> implements ButtonController {

    readonly isButton = true;

    constructor() {
        super(false);
    }

    abstract forGamepad(gamepad: number): InputController<boolean>;

    reset(): void {
        this.setValue(false);
    }

    abstract save(): ButtonControllerJson;
}

