import { Color, ImageResource, ReadonlyVector2d, Vector2d } from "@pluto/core";
import { PaintStyle } from "../../material/paint-style";
import { SvgPort } from "./svg-port";
import { LineStyle } from "../../material/line-style";
import { LinearGradientStyle } from "../../material/linear-gradient-style";
import { RadialGradientStyle } from "../../material/radial-gradient-style";
import { ColorStopsArray } from "../../material/color-stops";

export class PaintStyleWithGlobal {
    constructor(readonly paintStyle: PaintStyle, readonly global: boolean) { }

    at(boundingBoxBottomLeft: ReadonlyVector2d): PaintStyle {
        return this.paintStyle.cloneAt(boundingBoxBottomLeft);
    }
}

export class SvgParserContext {

    private constructor(
        private readonly root: SVGSVGElement,
        private readonly port: SvgPort,
        readonly viewboxLeft: number,
        readonly viewboxBottom: number,
        private readonly currentParameters: { [key: string]: string },
        private readonly paintStyles: Map<string, PaintStyleWithGlobal>,
        private readonly linearGradients: Map<string, SVGLinearGradientElement>,
        private readonly radialGradients: Map<string, SVGRadialGradientElement>
    ) { }

    static newInstance(svg: SVGSVGElement, port: SvgPort): SvgParserContext {
        const vb = svg.viewBox.baseVal;
        const parameters: { [key: string]: string } = {
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
        return new SvgParserContext(svg, port, vb.x, vb.height + vb.y, parameters, new Map(), new Map(), new Map());
    }

    getFill(el: SVGElement): string {
        return this.getResultingAttribute(el, 'fill', el.style.fill);
    }

    getFillOpacity(el: SVGElement): number {
        return Number.parseFloat(this.getResultingAttribute(el, 'fill-opacity', el.style.fillOpacity));
    }

    getFillRule(el: SVGElement): CanvasFillRule {
        return this.getResultingAttribute(el, 'fill-rule', el.style.fillRule) as CanvasFillRule;
    }

    getImage(url: string): Promise<ImageResource> {
        return this.port.getImage(url);
    }

    getLength(length: string): number {
        const l = this.root.createSVGLength();
        l.valueAsString = length;
        return l.value;
    }

    getLineStyle(el: SVGElement): LineStyle {
        const dash = this.getResultingAttribute(el, 'stroke-dasharray', el.style.strokeDasharray);
        return new LineStyle({
            lineCap: this.getResultingAttribute(el, 'stroke-linecap', el.style.strokeLinecap) as CanvasLineCap,
            lineJoin: this.getResultingAttribute(el, 'stroke-linejoin', el.style.strokeLinejoin) as CanvasLineJoin,
            miterLimit: Number.parseFloat(this.getResultingAttribute(el, 'stroke-miterlimit', el.style.strokeMiterlimit)),
            lineWidth: this.getLength(this.getResultingAttribute(el, 'stroke-width', el.style.strokeWidth)),
            lineDash: dash === 'none' ? undefined : dash.split(/\s+/).map(it => Number.parseFloat(it)),
            lineDashOffset: Number.parseFloat(this.getResultingAttribute(el, 'stroke-dashoffset', el.style.strokeDashoffset)),
        });
    }

    getOpacity(el: SVGElement): number {
        return Number.parseFloat(this.getResultingAttribute(el, 'opacity', el.style.opacity));
    }

    getPaintStyle(refName: string): PaintStyleWithGlobal {
        const ret = this.paintStyles.get(refName);
        if (ret == undefined) {
            const lg = this.getLinearGradients(refName);
            if (lg.length > 0) {
                const lgs = this.parseLinearGradient(lg);
                this.paintStyles.set(refName, lgs);
                return lgs;
            }
            const rg = this.getRadialGradients(refName);
            if (rg.length > 0) {
                const rgs = this.parseRadialGradient(rg);
                this.paintStyles.set(refName, rgs);
                return rgs;
            }
            throw new RangeError(`Paint style ${refName} not defined`);
        } else {
            return ret;
        }
    }

    getPatternImage(patternName: string): Promise<ImageResource> {
        return this.port.getPatternImage(patternName);
    }

    getStroke(el: SVGElement): string {
        return this.getResultingAttribute(el, 'stroke', el.style.stroke);
    }

    getStrokeOpacity(el: SVGElement): number {
        return Number.parseFloat(this.getResultingAttribute(el, 'stroke-opacity', el.style.strokeOpacity));
    }

    isVisible(el: SVGElement): boolean {
        const vis = this.getResultingAttribute(el, 'visibility', el.style.visibility);
        if (vis === 'hidden' || vis === 'collapse') {
            return false;
        }
        const dis = this.getResultingAttribute(el, 'display', el.style.display);
        if (dis === 'none') {
            return false;
        }
        return true;
    }

    setLinearGradient(el: SVGLinearGradientElement) {
        const id = el.getAttribute('id');
        if (id != null) {
            this.linearGradients.set(id, el);
        }
    }

    setPaintStyle(refName: string, style: PaintStyleWithGlobal) {
        this.paintStyles.set(refName, style);
    }

    setRadialGradient(el: SVGRadialGradientElement) {
        const id = el.getAttribute('id');
        if (id != null) {
            this.radialGradients.set(id, el);
        }
    }

    transform(x: number, y: number): Vector2d {
        return new Vector2d(x - this.viewboxLeft, this.viewboxBottom - y);
    }

    transformWithMatrix(transform: SVGTransform, x: number, y: number): Vector2d {
        // TODO verify
        const m = transform.matrix;
        return new Vector2d(m.a * x + m.b * y + m.e - this.viewboxLeft, this.viewboxBottom - m.c * x - m.d * y - m.f);
    }

    withChild(el: SVGElement): SvgParserContext {
        const ret = new SvgParserContext(this.root, this.port, this.viewboxLeft, this.viewboxBottom, { ...this.currentParameters }, this.paintStyles, this.linearGradients, this.radialGradients);
        ret.calculateAttributes(el);
        return ret;
    }

    withChildSvg(svg: SVGSVGElement): SvgParserContext {
        const vb = svg.viewBox.baseVal;
        const ret = new SvgParserContext(this.root, this.port, vb.x, vb.height + vb.y, { ...this.currentParameters }, this.paintStyles, this.linearGradients, this.radialGradients);
        ret.calculateAttributes(svg);
        return ret;
    }

    private calculateAttributes(el: SVGElement) {
        this.setResultingAttribute(el, 'color', el.style.color);
        this.setResultingAttribute(el, 'clip-rule', el.style.clipRule);
        this.setResultingAttribute(el, 'display', el.style.display);
        this.setResultingAttribute(el, 'fill', el.style.fill);
        this.setResultingAttribute(el, 'fill-opacity', el.style.fillOpacity);
        this.setResultingAttribute(el, 'fill-rule', el.style.fillRule);
        this.setResultingAttribute(el, 'opacity', el.style.opacity);
        this.setResultingAttribute(el, 'stroke', el.style.stroke);
        this.setResultingAttribute(el, 'stroke-dasharray', el.style.strokeDasharray);
        this.setResultingAttribute(el, 'stroke-dashoffset', el.style.strokeDashoffset);
        this.setResultingAttribute(el, 'stroke-linecap', el.style.strokeLinecap);
        this.setResultingAttribute(el, 'stroke-linejoin', el.style.strokeLinejoin);
        this.setResultingAttribute(el, 'stroke-miterlimit', el.style.strokeMiterlimit);
        this.setResultingAttribute(el, 'stroke-opacity', el.style.strokeOpacity);
        this.setResultingAttribute(el, 'stroke-width', el.style.strokeWidth);
        this.setResultingAttribute(el, 'visibility', el.style.visibility);
    }

    private getLinearGradients(topName: string): SVGLinearGradientElement[] {
        const top = this.linearGradients.get(topName);
        if (top != undefined) {
            let ref = top.href.baseVal;
            if (ref == '') {
                return [top];
            } else {
                const children = this.getLinearGradients(ref.substring(1));
                if (children.length == 0) {
                    throw new RangeError(`Referenced linear gradient ${ref} not found`);
                }
                return [top, ...children];
            }
        }
        return [];
    }

    private getRadialGradients(topName: string): SVGRadialGradientElement[] {
        const top = this.radialGradients.get(topName);
        if (top != undefined) {
            let ref = top.href.baseVal;
            if (ref == '') {
                return [top];
            } else {
                const children = this.getRadialGradients(ref.substring(1));
                if (children.length == 0) {
                    throw new RangeError(`Referenced radial gradient ${ref} not found`);
                }
                return [top, ...children];
            }
        }
        return [];
    }

    private getResultingAttribute(el: SVGElement, attributeName: string, style: string): string {
        const att = el.getAttribute(attributeName);
        if (att != null) {
            return att;
        } else if (style !== '') {
            return style;
        } else {
            return this.currentParameters[attributeName]!;
        }
    }

    private parseLinearGradient(el: SVGLinearGradientElement[]): PaintStyleWithGlobal {
        const transform = el[0]!.gradientTransform.baseVal.consolidate();
        if (el[0]!.spreadMethod.baseVal != el[0]!.SVG_SPREADMETHOD_PAD) {
            console.warn('Spread method is not supported');
        }
        const start = transform == null ? this.transform(el[0]!.x1.baseVal.value, el[0]!.y1.baseVal.value) : this.transformWithMatrix(transform, el[0]!.x1.baseVal.value, el[0]!.y1.baseVal.value);
        const end = transform == null ? this.transform(el[0]!.x2.baseVal.value, el[0]!.y2.baseVal.value) : this.transformWithMatrix(transform, el[0]!.x2.baseVal.value, el[0]!.y2.baseVal.value);
        const style = new LinearGradientStyle({
            start,
            end,
            colorStops: this.parseStops(el)
        });
        return new PaintStyleWithGlobal(style, el[0]!.gradientUnits.baseVal === SVGUnitTypes.SVG_UNIT_TYPE_USERSPACEONUSE);
    }

    private parseRadialGradient(el: SVGRadialGradientElement[]): PaintStyleWithGlobal {
        const transform = el[0]!.gradientTransform.baseVal.consolidate();
        if (el[0]!.spreadMethod.baseVal != el[0]!.SVG_SPREADMETHOD_PAD) {
            console.warn('Spread method is not supported');
        }
        const start = transform == null ? this.transform(el[0]!.fx.baseVal.value, el[0]!.fy.baseVal.value) : this.transformWithMatrix(transform, el[0]!.fx.baseVal.value, el[0]!.fy.baseVal.value);
        const end = transform == null ? this.transform(el[0]!.cx.baseVal.value, el[0]!.cy.baseVal.value) : this.transformWithMatrix(transform, el[0]!.cx.baseVal.value, el[0]!.cy.baseVal.value);
        const style = new RadialGradientStyle({
            startPosition: start,
            endPosition: end,
            startRadius: el[0]!.fr.baseVal.value,
            endRadius: el[0]!.r.baseVal.value,
            colorStops: this.parseStops(el)
        });
        return new PaintStyleWithGlobal(style, el[0]!.gradientUnits.baseVal === SVGUnitTypes.SVG_UNIT_TYPE_USERSPACEONUSE);
    }

    private parseStops(el: SVGGradientElement[]): ColorStopsArray {
        const ret: ColorStopsArray = [];
        const stops = el.map(it => it.querySelectorAll('stop')).filter(it => it.length > 0);
        if (stops.length > 0) {
            stops[0]!.forEach(it => {
                ret.push({
                    color: this.parseStopColor(it),
                    offset: it.offset.baseVal
                });
            });
        }
        return ret;
    }

    private parseStopColor(el: SVGStopElement): Color {
        const colorAtt = el.getAttribute('stop-color');
        const colorStyle = el.style.stopColor;
        const opacityAtt = el.getAttribute('stop-opacity');
        const opacityStyle = el.style.stopOpacity;
        let color: Color;
        if (colorAtt != null) {
            color = Color.parse(colorAtt);
        } else if (colorStyle !== '') {
            color = Color.parse(colorStyle);
        } else {
            color = new Color(0, 0, 0);
        }
        if (opacityAtt != null) {
            return color.withAlpha(Number.parseFloat(opacityAtt));
        } else if (opacityStyle !== '') {
            return color.withAlpha(Number.parseFloat(opacityStyle));
        } else {
            return color;
        }
    }

    private setResultingAttribute(el: SVGElement, attributeName: string, style: string) {
        const att = el.getAttribute(attributeName);
        if (att != null) {
            this.currentParameters[attributeName] = att;
        } else if (style !== '') {
            this.currentParameters[attributeName] = style;
        }
    }
}