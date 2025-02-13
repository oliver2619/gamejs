import { Color, ReferencedObjects } from "@ge/common";
import { Scene3d } from "./scene-3d";
import { Fog } from "./fog/fog";
import { NoFog } from "./fog/no-fog";
import { Background3d } from "./background/background-3d";
import { ColorBackground3d } from "./background/color-background-3d";
import { Light } from "./light/light";

export class DefaultScene3d implements Scene3d {

    fog: Fog = NoFog.instance;

    private _background: Background3d = new ColorBackground3d(new Color(0, 0, 0));
    private readonly ambientLights: Light[] = [];

    get background(): Background3d {
        return this._background;
    }

    set background(b: Background3d) {
        if (this._background !== b) {
            this._background.releaseReference(this);
            this._background = b;
            this._background.addReference(this);
        }
    }

    private readonly referencedObject = ReferencedObjects.create(() => this.onDelete());

    constructor() {
        this._background.addReference(this);
    }

    addLight(light: Light): void {
        if (light.isAmbient) {
            this.ambientLights.push(light);
        }
        light.addReference(this);
    }

    addReference(owner: any): void {
        this.referencedObject.addReference(owner);
    }

    releaseReference(owner: any): void {
        this.referencedObject.releaseReference(owner);
    }

    removeLight(light: Light): void {
        if(light.isAmbient) {
            const i = this.ambientLights.indexOf(light);
            if(i < 0) {
                throw new Error('Light not added to scene.');
            }
            this.ambientLights.splice(i, 1);
        }
        light.releaseReference(this);
    }

    renderImmediate(): void {
        this._background.render();
    }
    
    private onDelete() {
        this._background.releaseReference(this);
        this.ambientLights.forEach(it => it.releaseReference(this));
        // TODO all lights: release reference
    }
}