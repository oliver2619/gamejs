import { SvgParserContext } from "./svg-parser-context";
import { SvgPort } from "./svg-port";

export class SvgParser<LINESTYLE> {

    parseString(input: string, port: SvgPort) {
        const div = document.createElement('div');
        div.innerHTML = input;
        const child = div.firstElementChild;
        if (child != null) {
            if (child instanceof SVGSVGElement) {
                this.parseElement(child, port);
            } else {
                throw new RangeError(`Could not parse ${child.nodeName} as SVG.`);
            }
        } else {
            throw RangeError('Could not parse string as SVG.');
        }
    }

    parseElement(element: SVGSVGElement, port: SvgPort) {
        this.parseSvgRoot(element, port, new SvgParserContext(element, port));
    }

    private parseSvgRoot(element: SVGSVGElement, port: SvgPort, context: SvgParserContext<LINESTYLE>) {
        element.x;
        element.y;
        element.currentScale;
        element.currentTranslate.x;
        element.currentTranslate.y;
        this.parseGraphicsElement(element, context);
    }

    private parseGraphicsElement(element: SVGGraphicsElement, context: SvgParserContext<LINESTYLE>) {
        element.transform.baseVal;
        this._parseElement(element, context);
    }

    private _parseElement(element: SVGElement, context: SvgParserContext<LINESTYLE>) {
        context.withElement(element, () => {
            element.dataset;

        });
    }
}