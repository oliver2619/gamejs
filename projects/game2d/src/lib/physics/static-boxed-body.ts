import { Box3, ReadonlyBox2, ReadonlyBox3 } from "projects/core/src/public-api";
import { StaticBody, StaticBodyData } from "./static-body";

export abstract class StaticBoxedBody extends StaticBody {

    get boundingBox(): ReadonlyBox3 {
        return this._boundingBox;
    }

    private _boundingBox: Box3 = Box3.empty();

    constructor(data: StaticBodyData) {
        super(data);
    }

    protected postConstruct(boundingBox: ReadonlyBox2) {
        this._boundingBox.clear();
        if (boundingBox.minimum != undefined && boundingBox.maximum != undefined) {
            this._boundingBox.extend(boundingBox.minimum.x, boundingBox.minimum.y, this.z);
            this._boundingBox.extend(boundingBox.maximum.x, boundingBox.maximum.y, this.z + this.zDepth);
        }
    }
}