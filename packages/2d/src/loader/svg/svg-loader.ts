import { NamedObjectMap } from "../../scene";
import { ObjectLoaderData, ObjectLoaderImageMapper, ObjectLoaderPatternMapper, StringParsingObjectLoader } from "../object-loader";
import { SvgParser } from "./svg-parser";
import { SvgParserDefaultTarget } from "./svg-parser-default-target";

export class SvgLoader extends StringParsingObjectLoader {

    private readonly patternMapper: ObjectLoaderPatternMapper;
    private readonly imageMapper: ObjectLoaderImageMapper;

    constructor(data: Readonly<ObjectLoaderData>) {
        super();
        this.patternMapper = data.patternMapper;
        this.imageMapper = data.imageMapper;
    }

    parse(input: string): Promise<NamedObjectMap> {
        const target = new SvgParserDefaultTarget({
            patternMapper: this.patternMapper,
            imageMapper: this.imageMapper
        });
        new SvgParser().parseString(input, target);
        return target.getResult();
    }

}