import { Fog } from "./fog";

export class NoFog implements Fog {

    static readonly instance = new NoFog();

    private constructor() {
    }
}