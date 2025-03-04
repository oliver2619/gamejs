import { NamedObjectMap } from "../../scene/object/named-object-map";
import { ObjectLoaderImageMapper, ObjectLoaderPatternMapper } from "../object-loader";
import { SvgParserTarget } from "./svg-parser-target";

export class SvgParserDefaultTarget implements SvgParserTarget{

    constructor(data: { patternMapper: ObjectLoaderPatternMapper, imageMapper: ObjectLoaderImageMapper }) {}

    getResult(): Promise<NamedObjectMap> {
        const ret = new NamedObjectMap({
            root: this.root.object,
            objectsByName: this.objectsByName,
            solidsByName: this.solidsByName
        });
        return this.promisesProgress.wait().then(() => ret);
    }
}