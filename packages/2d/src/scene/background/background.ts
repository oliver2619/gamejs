import { AbstractReferencedObject } from "@pluto/core";

export abstract class Background extends AbstractReferencedObject {
    abstract render(): void;
}