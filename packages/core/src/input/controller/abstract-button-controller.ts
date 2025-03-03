import { ButtonController } from "../input-controller";
import { ButtonControllerJson } from "../input-controller-json";
import { AbstractInputController } from "./abstract-input-controller";

export abstract class AbstractButtonController extends AbstractInputController<boolean> implements ButtonController {

    readonly isButton = true;

    constructor() {
        super(false);
    }

    reset(): void {
        this.setValue(false);
    }

    abstract save(): ButtonControllerJson;
}

