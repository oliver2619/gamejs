import { Showcase2d } from "./showcase-2d";
import { Showcase3d } from "./showcase-3d";

export interface CanvasAdapter2dRouteData {
    showcase: new () => Showcase2d
}

export interface CanvasAdapter3dRouteData {
    showcase: new () => Showcase3d
}