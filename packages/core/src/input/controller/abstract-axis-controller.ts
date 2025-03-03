import { AxisController } from "../input-controller";
import { AxisControllerJson } from "../input-controller-json";
import { AbstractInputController } from "./abstract-input-controller";

export abstract class AbstractAxisController extends AbstractInputController<number> implements AxisController {

    readonly isButton = false;

    constructor() {
        super(0);
    }

    reset(): void {
        this.setValue(0);
    }

    abstract save(): AxisControllerJson;
}

