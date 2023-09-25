import {CoordSystem2, CoordSystem2Data} from 'core/src/index';
import {Solid2} from "./solid2";

export class Object2 extends CoordSystem2 {

    solids: Solid2[] = [];
    objectsBack: Object2[] = [];
    objectsFront: Object2[] = [];

    constructor(data: CoordSystem2Data) {
        super(data);
    }

}