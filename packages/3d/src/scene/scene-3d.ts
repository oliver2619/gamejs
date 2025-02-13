import { ReferencedObject } from "@ge/common";
import { Fog } from "./fog/fog";
import { Background3d } from "./background/background-3d";
import { Light } from "./light/light";

export interface Scene3d extends ReferencedObject {

    fog: Fog;
    background: Background3d;

    addLight(light: Light): void;

    removeLight(light: Light): void;

    renderImmediate(): void;
}