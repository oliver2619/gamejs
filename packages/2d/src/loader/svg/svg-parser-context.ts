import { ImageResource, Vector2d } from "@pluto/core";
import { SvgPort } from "./svg-port";

interface SvgParserArguments {
    'clip-rule': string;
    color: string;
    display: string;
    fill: string;
    'fill-opacity': string;
    'fill-rule': string;
    opacity: string;
    stroke: string;
    'stroke-dasharray': string;
    'stroke-dashoffset': string;
    'stroke-linecap': string;
    'stroke-linejoin': string;
    'stroke-miterlimit': string;
    'stroke-opacity': string;
    'stroke-width': string;
    visibility: string;
};

interface SvgParserState {
    arguments: SvgParserArguments;
    id: string | undefined;
    classes: string[];
}
export class SvgParserContext<LINESTYLE> {

    private state: SvgParserState = {
        arguments: SvgParserContext.getInitialState(),
        id: undefined,
        classes: []
    };

    readonly viewboxLeft: number;
    readonly viewboxBottom: number;

    get fill(): string {
        return this.state.arguments.fill;
    }

    get fillOpacity(): number {
        return Number.parseFloat(this.state.arguments["fill-opacity"]);
    }

    get fillRule(): CanvasFillRule {
        return this.state.arguments["fill-rule"] as CanvasFillRule;
    }

    get lineStyle(): LINESTYLE {
        const dash = this.state.arguments["stroke-dasharray"];
        return this.port.getLineStyle({
            lineCap: this.state.arguments["stroke-linecap"] as CanvasLineCap,
            lineJoin: this.state.arguments["stroke-linejoin"] as CanvasLineJoin,
            miterLimit: Number.parseFloat(this.state.arguments["stroke-miterlimit"]),
            lineWidth: this.getLength(this.state.arguments["stroke-width"]),
            lineDash: dash === 'none' ? undefined : dash.split(/\s+/).map(it => Number.parseFloat(it)),
            lineDashOffset: Number.parseFloat(this.state.arguments["stroke-dashoffset"]),
        });
    }

    get opacity(): number {
        return Number.parseFloat(this.state.arguments.opacity);
    }

    get stroke(): string {
        return this.state.arguments.stroke;
    }

    get strokeOpacity(): number {
        return Number.parseFloat(this.state.arguments["stroke-opacity"]);
    }

    get visible(): boolean {
        const vis = this.state.arguments.visibility;
        if (vis === 'hidden' || vis === 'collapse') {
            return false;
        }
        const dis = this.state.arguments.display;
        if (dis === 'none') {
            return false;
        }
        return true;
    }

    constructor(private readonly root: SVGSVGElement, private readonly port: SvgPort) {
        const vb = root.viewBox.baseVal;
        this.viewboxLeft = vb.x;
        this.viewboxBottom = vb.height + vb.y;
        this.updateAllStateValues(root);
    }

    getImage(url: string): Promise<ImageResource> {
        return this.port.getImage(url);
    }

    getLength(length: string): number {
        const l = this.root.createSVGLength();
        l.valueAsString = length;
        return l.value;
    }

    getPatternImage(patternName: string): Promise<ImageResource> {
        return this.port.getPatternImage(patternName);
    }

    transform(x: number, y: number): Vector2d {
        return new Vector2d(x - this.viewboxLeft, this.viewboxBottom - y);
    }

    transformWithMatrix(transform: SVGTransform, x: number, y: number): Vector2d {
        // TODO verify
        const m = transform.matrix;
        return new Vector2d(m.a * x + m.c * x + m.e - this.viewboxLeft, this.viewboxBottom - m.b * y - m.d * y - m.f);
    }

    withElement(el: SVGElement, callback: () => void) {
        const prevState = this.state;
        try {
            this.state = { arguments: { ...this.state.arguments }, classes: [...this.state.classes], id: this.state.id };
            this.updateAllStateValues(el);
            callback();
        }
        finally {
            this.state = prevState;
        }
    }

    private static getInitialState(): SvgParserArguments {
        return {
            'clip-rule': 'nonzero', // unprocessed
            'color': 'black', // unprocessed
            'display': 'inline',
            'fill': 'black',
            'fill-opacity': '1',
            'fill-rule': 'nonzero',
            'opacity': '1',
            'stroke': 'none',
            'stroke-dasharray': 'none',
            'stroke-dashoffset': '0',
            'stroke-linecap': 'butt',
            'stroke-linejoin': 'miter',
            'stroke-miterlimit': '4',
            'stroke-opacity': '1',
            'stroke-width': '1px',
            'visibility': 'visible'
        };
    }

    private updateAllStateValues(el: SVGElement) {
        el.classList.forEach(it => this.state.classes.push(it));
        if (el.id !== '') {
            this.state.id = el.id;
        }
        this.updateState(el, 'color', 'color');
        this.updateState(el, 'clip-rule', 'clipRule');
        this.updateState(el, 'display', 'display');
        this.updateState(el, 'fill', 'fill');
        this.updateState(el, 'fill-opacity', 'fillOpacity');
        this.updateState(el, 'fill-rule', 'fillRule');
        this.updateState(el, 'opacity', 'opacity');
        this.updateState(el, 'stroke', 'stroke');
        this.updateState(el, 'stroke-dasharray', 'strokeDasharray');
        this.updateState(el, 'stroke-dashoffset', 'strokeDashoffset');
        this.updateState(el, 'stroke-linecap', 'strokeLinecap');
        this.updateState(el, 'stroke-linejoin', 'strokeLinejoin');
        this.updateState(el, 'stroke-miterlimit', 'strokeMiterlimit');
        this.updateState(el, 'stroke-opacity', 'strokeOpacity');
        this.updateState(el, 'stroke-width', 'strokeWidth');
        this.updateState(el, 'visibility', 'visibility');
    }

    private updateState(el: SVGElement, attributeName: keyof SvgParserArguments, styleName: keyof CSSStyleDeclaration) {
        const style = el.style[styleName];
        if (style !== '' && typeof style === 'string') {
            this.state.arguments[attributeName] = style;
        }
        const att = el.getAttribute(attributeName);
        if (att != null) {
            this.state.arguments[attributeName] = att;
        }
    }
}