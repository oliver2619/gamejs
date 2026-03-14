import { ColorBackground3d, DefaultScene3d } from "@pluto/3d";
import { Showcase3d } from "../showcase-3d";
import { Color } from "@pluto/core";

export class Basic3dShowcase extends Showcase3d {

    protected override initScene(scene: DefaultScene3d): void {
        scene.background = new ColorBackground3d(new Color(0, 0.2, 0.4));
    }
}