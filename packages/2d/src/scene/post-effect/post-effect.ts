import { AbstractReferencedObject } from "@pluto/core";

export abstract class PostEffect extends AbstractReferencedObject {
    abstract render(): void;
}