import { Box3d, ReadonlyBox2d, ReadonlyBox3d } from "@pluto/core";
import { StaticBody, StaticBodyData } from "./static-body";

export abstract class StaticBoxedBody extends StaticBody {

    get boundingBox(): ReadonlyBox3d {
        return this._boundingBox;
    }

    private _boundingBox: Box3d = Box3d.empty();

    constructor(data: StaticBodyData) {
        super(data);
    }

    protected postConstruct(boundingBox: ReadonlyBox2d) {
        this._boundingBox.clear();
        if (boundingBox.minimum != undefined && boundingBox.maximum != undefined) {
            this._boundingBox.extend(boundingBox.minimum.x, boundingBox.minimum.y, this.z);
            this._boundingBox.extend(boundingBox.maximum.x, boundingBox.maximum.y, this.z + this.zDepth);
        }
    }
}