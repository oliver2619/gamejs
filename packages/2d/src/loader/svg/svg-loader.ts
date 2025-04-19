import { ResourceLoader } from "@pluto/core";
import { Object2d } from "../../scene";
import { Object2dLoader, Object2dLoaderData, Object2dLoaderImageMapper, Object2dLoaderPatternMapper } from "../object-2d-loader";
import { SvgParserOld } from "./svg-parser_bak";
import { SvgDefaultPort } from "./svg-default-port";

export class SvgLoader implements Object2dLoader {

    private readonly patternMapper: Object2dLoaderPatternMapper;
    private readonly imageMapper: Object2dLoaderImageMapper;
    private readonly baseUrl: string | undefined;

    constructor(data: Readonly<Object2dLoaderData>) {
        this.patternMapper = data.patternMapper;
        this.imageMapper = data.imageMapper;
        this.baseUrl = data.baseUrl;
    }

    loadObject(url: string): Promise<Object2d> {
        return new ResourceLoader(this.baseUrl).loadText(url).then(r => this.parse(r));
    }

    private parse(input: string): Promise<Object2d> {
        const port = new SvgDefaultPort({
            patternMapper: this.patternMapper,
            imageMapper: this.imageMapper
        });
        new SvgParserOld().parseString(input, port);
        return port.getResult();
    }
}