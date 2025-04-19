import { AbstractReferencedObject } from "@pluto/core";

export interface LayerData {
    visible?: boolean | undefined;
}

export abstract class Layer extends AbstractReferencedObject {

    visible: boolean;

    constructor(data?: Readonly<LayerData>) {
        super();
        this.visible = data?.visible ?? true;
    }

    abstract preRender(): void;

    abstract render(): void;

    abstract renderDebug(): void;

}