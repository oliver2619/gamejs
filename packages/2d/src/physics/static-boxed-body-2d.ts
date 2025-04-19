import { Box3d, ReadonlyBox2d, ReadonlyBox3d } from "@pluto/core";
import { StaticBody2d, StaticBody2dData } from "./static-body-2d";

export abstract class StaticBoxedBody2d extends StaticBody2d {

    get boundingBox(): ReadonlyBox3d {
        return this._boundingBox;
    }

    private _boundingBox: Box3d = Box3d.empty();

    constructor(data: StaticBody2dData) {
        super(data);
    }

    protected postConstruct(boundingBox: ReadonlyBox2d) {
        this._boundingBox.clear();
        if (boundingBox.minimum != undefined && boundingBox.maximum != undefined) {
            this._boundingBox.extend(boundingBox.minimum.x, boundingBox.minimum.y, this.z - this.zDepth * .5);
            this._boundingBox.extend(boundingBox.maximum.x, boundingBox.maximum.y, this.z + this.zDepth * .5);
        }
    }
}