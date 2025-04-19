import { Color, CoordSystem2d, CoordSystem2dData, ImageFactory, ImageResource, ReadonlyVector2d, Vector2d } from "@pluto/core";
import { PaintStyleWithGlobal, SvgParserContextBak } from "./svg-parser-context_bak";
import { SvgElementData, ElementPortBak, SvgMaterializedElementData, SvgPortBak } from "./svg-port-bak";
import { PaintStyle } from "../../material/paint-style";
import { ColorStyle } from "../../material/color-style";
import { Material2d, PatternStyle, PatternStyleData } from "../../material";
import { SvgPathParser } from "./svg-path-parser";

export class SvgParserOld {

    parseString(input: string, port: SvgPortBak) {
        const div = document.createElement('div');
        div.innerHTML = input;
        const child = div.firstElementChild;
        if (child != null && child instanceof SVGSVGElement) {
            this.parseElement(child, port);
        } else {
            throw RangeError('Could not parse string as SVG.');
        }
    }

    parseElement(input: SVGSVGElement, port: SvgPortBak) {
        this.parseChildren(input, port.root, SvgParserContextBak.newInstance(input, port));
    }

    private getCoordSystemFromElement(el: SVGGElement | SVGSVGElement): CoordSystem2dData {
        const transform = el.transform.baseVal.consolidate();
        const offset = el instanceof SVGSVGElement ? new Vector2d(el.x.baseVal.value, el.y.baseVal.value) : new Vector2d(0, 0);
        if (transform == null) {
            return { position: offset };
        } else {
            const ret = this.getCoordSystemFromTransform(transform);
            return { ...ret, position: ret.position?.getSum(offset) ?? offset };
        }
    }

    private getCoordSystemFromTransform(transform: SVGTransform): CoordSystem2dData {
        const position = new Vector2d(0, 0);
        const x = new Vector2d(1, 0);
        const y = new Vector2d(0, 1);
        const m = transform.matrix;
        // TODO verify:
        x.x = m.a;
        y.x = m.b;
        x.y = m.c;
        y.y = m.d;
        position.x += m.e;
        position.y += m.f;
        const ret: CoordSystem2dData = {
            position,
            xAxis: x,
            yAxis: y
        };
        return ret;
    }

    private getElementData(el: SVGElement, context: SvgParserContextBak): SvgElementData {
        const classes = new Set<string>();
        el.classList.forEach(it => classes.add(it));
        const d: SvgElementData = {
            classes,
            opacity: context.getOpacity(el),
            visible: context.isVisible(el),
            id: el.id === '' ? undefined : el.id
        };
        return d;
    }

    private getFillStyle(el: SVGElement, boundingBoxBottomLeft: ReadonlyVector2d, context: SvgParserContextBak): PaintStyle | undefined {
        const fill = context.getFill(el);
        const fillOpacity = context.getFillOpacity(el);
        if (fill === 'none' || fill === 'context-fill') {
            return undefined;
        }
        return this.getPaintStyle(fill, fillOpacity, boundingBoxBottomLeft, context);
    }

    private getMaterializedElementData(el: SVGGraphicsElement, context: SvgParserContextBak): SvgMaterializedElementData {
        const bb = el.getBBox({ clipped: true, fill: true, stroke: true });
        const bbBottomLeft = context.transform(bb.x, bb.y + bb.height);
        const material = new Material2d({
            fill: this.getFillStyle(el, bbBottomLeft, context),
            stroke: this.getStrokeStyle(el, bbBottomLeft, context),
            line: context.getLineStyle(el)
        });
        // TODO composite operations
        // TODO filter
        return {
            ...this.getElementData(el, context),
            material,
            fillRule: material.fill == undefined ? undefined : context.getFillRule(el),
            stroke: material.stroke != undefined
        };
    }

    private getPaintStyle(color: string, opacity: number, boundingBoxBottomLeft: ReadonlyVector2d, context: SvgParserContextBak): PaintStyle | undefined {
        if (color === 'none') {
            return undefined;
        }
        const result = /^url\([\"\']?#(?<name>[^\)\"\']+)[\"\']?\)$/i.exec(color.trim());
        if (result == null) {
            return new ColorStyle(Color.parse(color).withAlpha(opacity));
        } else {
            const name = result.groups!['name']!;
            return context.getPaintStyle(name).at(boundingBoxBottomLeft);
        }
    }

    private getStrokeStyle(el: SVGElement, boundingBoxBottomLeft: ReadonlyVector2d, context: SvgParserContextBak): PaintStyle | undefined {
        const stroke = context.getStroke(el);
        const strokeOpacity = context.getStrokeOpacity(el);
        if (stroke === 'none' || stroke === 'context-stroke') {
            return undefined;
        }
        return this.getPaintStyle(stroke, strokeOpacity, boundingBoxBottomLeft, context);
    }

    private parseChildren(el: Element, obj: ElementPortBak, context: SvgParserContextBak) {
        el.querySelectorAll('defs').forEach(it => this.parseDefs(it, context));
        el.querySelectorAll('filter').forEach(it => this.parseFilter(it, context));
        el.querySelectorAll('symbol').forEach(it => this.parseSymbol(it, context));
        for (let i = 0; i < el.children.length; ++i) {
            const c = el.children.item(i);
            if (c != null && c.nodeName !== 'defs' && c.nodeName !== 'symbol' && c.nodeName !== 'filter') {
                this._parseElement(c, obj, context);
            }
        }
    }

    private parseCircle(el: SVGCircleElement, obj: ElementPortBak, context: SvgParserContextBak) {
        obj.addCircle({
            center: context.transform(el.cx.baseVal.value, el.cy.baseVal.value),
            r: el.r.baseVal.value
        }, this.getMaterializedElementData(el, context));
    }

    private parseDefs(el: SVGDefsElement, context: SvgParserContextBak) {
        for (let i = 0; i < el.children.length; ++i) {
            const c = el.children.item(i);
            if (c != null) {
                switch (c.nodeName) {
                    case 'filter':
                        this.parseFilter(c as SVGFilterElement, context);
                        break;
                    case 'linearGradient':
                        context.setLinearGradient(c as SVGLinearGradientElement);
                        break;
                    case 'pattern':
                        this.parsePattern(c as SVGPatternElement, context);
                        break;
                    case 'radialGradient':
                        context.setRadialGradient(c as SVGRadialGradientElement);
                        break;
                    default:
                        // TODO load rest of defs
                        console.warn(`<${c.nodeName}> elements in <defs> are not supported yet`);
                }
            }
        }
    }

    private _parseElement(el: Element, obj: ElementPortBak, context: SvgParserContextBak) {
        switch (el.nodeName) {
            case 'circle':
                this.parseCircle(el as SVGCircleElement, obj, context);
                break;
            case 'ellipse':
                this.parseEllipse(el as SVGEllipseElement, obj, context);
                break;
            case 'g':
                this.parseGroup(el as SVGGElement, obj, context);
                break;
            case 'image':
                this.parseImage(el as SVGImageElement, obj, context);
                break;
            case 'line':
                this.parseLine(el as SVGLineElement, obj, context);
                break;
            case 'path':
                this.parsePath(el as SVGPathElement, obj, context);
                break;
            case 'polygon':
                this.parsePolygon(el as SVGPolygonElement, obj, context);
                break;
            case 'polyline':
                this.parsePolyline(el as SVGPolylineElement, obj, context);
                break;
            case 'rect':
                this.parseRect(el as SVGRectElement, obj, context);
                break;
            case 'svg':
                this.parseSvg(el as SVGSVGElement, obj, context);
                break;
            case 'text':
                this.parseText(el as SVGTextElement, obj, context);
                break;
            case 'use':
                this.parseUse(el as SVGUseElement, obj, context);
                break;
            default:
                console.warn(`<${el.nodeName}> elements are not supported yet.`);
        }
    }

    private parseEllipse(el: SVGEllipseElement, obj: ElementPortBak, context: SvgParserContextBak) {
        obj.addEllipse({
            center: context.transform(el.cx.baseVal.value, el.cy.baseVal.value),
            r: new Vector2d(el.rx.baseVal.value, el.ry.baseVal.value)
        }, this.getMaterializedElementData(el, context));
    }

    private parseFilter(_1: SVGFilterElement, _2: SvgParserContextBak) {
        console.warn('<filter> elements are not supported yet');
        // TODO implement filter
    }

    private parseGroup(el: SVGGElement, obj: ElementPortBak, context: SvgParserContextBak) {
        const g = obj.addGroup({
            coordSystem: this.getCoordSystemFromElement(el)
        }, this.getMaterializedElementData(el, context));
        this.parseChildren(el, g, context.withChild(el));
    }

    private parseImage(el: SVGImageElement, obj: ElementPortBak, context: SvgParserContextBak) {
        const img = obj.addImage({
            x: el.x.baseVal.value - context.viewboxLeft,
            y: context.viewboxBottom - el.y.baseVal.value - el.height.baseVal.value,
            width: el.width.baseVal.value,
            height: el.height.baseVal.value
        }, this.getMaterializedElementData(el, context));
        context.getImage(el.href.baseVal).then(it => img.setImage(it));
    }

    private parseLine(el: SVGLineElement, obj: ElementPortBak, context: SvgParserContextBak) {
        obj.addLine({
            p1: context.transform(el.x1.baseVal.value, el.y1.baseVal.value),
            p2: context.transform(el.x2.baseVal.value, el.y2.baseVal.value)
        }, this.getMaterializedElementData(el, context));
    }

    private parsePath(el: SVGPathElement, obj: ElementPortBak, context: SvgParserContextBak) {
        const d = el.getAttribute('d');
        if (d != null) {
            const path = obj.addPath(this.getMaterializedElementData(el, context));
            SvgPathParser.parse(d, context.viewboxLeft, context.viewboxBottom, path);
            path.end();
        }
    }

    private parsePattern(el: SVGPatternElement, context: SvgParserContextBak) {
        const id = el.getAttribute('id');
        if (id != null) {
            const transform = el.patternTransform.baseVal.consolidate();
            // TODO use with and height
            // el.width.baseVal.value;
            // el.height.baseVal.value;
            const pattern: PatternStyleData = {
                image: new ImageResource(ImageFactory.emptyImage(8), 1),
                offset: new Vector2d(el.x.baseVal.value, el.y.baseVal.value),
                repetition: 'repeat',
                transform: transform == null ? undefined : new CoordSystem2d(this.getCoordSystemFromTransform(transform)),
            };
            const style = new PatternStyle(pattern);
            context.getPatternImage(id).then(it => style.image = it);
            context.setPaintStyle(id, new PaintStyleWithGlobal(style, el.patternUnits.baseVal === SVGUnitTypes.SVG_UNIT_TYPE_USERSPACEONUSE));
        }
    }

    private parsePolygon(el: SVGPolygonElement, obj: ElementPortBak, context: SvgParserContextBak) {
        obj.addPolygon({
            points: Array.from(el.points).map(it => context.transform(it.x, it.y))
        }, this.getMaterializedElementData(el, context));
    }

    private parsePolyline(el: SVGPolylineElement, obj: ElementPortBak, context: SvgParserContextBak) {
        obj.addPolyline({
            points: Array.from(el.points).map(it => context.transform(it.x, it.y))
        }, this.getMaterializedElementData(el, context));
    }

    private parseRect(el: SVGRectElement, obj: ElementPortBak, context: SvgParserContextBak) {
        obj.addRect({
            x: el.x.baseVal.value - context.viewboxLeft,
            y: context.viewboxBottom - el.y.baseVal.value - el.height.baseVal.value,
            width: el.width.baseVal.value,
            height: el.height.baseVal.value
        }, this.getMaterializedElementData(el, context));
    }

    private parseSvg(el: SVGSVGElement, obj: ElementPortBak, context: SvgParserContextBak) {
        const g = obj.addGroup({
            coordSystem: this.getCoordSystemFromElement(el)
        }, this.getMaterializedElementData(el, context));
        this.parseChildren(el, g, context.withChildSvg(el));
    }

    private parseSymbol(_el: SVGSymbolElement, _context: SvgParserContextBak) {
        console.warn('<symbol> elements are not supported yet');
        // TODO
    }

    private parseText(_el: SVGTextElement, _obj: ElementPortBak, _context: SvgParserContextBak) {
        console.warn('<text> elements are not supported yet');
        // TODO
    }

    private parseUse(_el: SVGUseElement, _obj: ElementPortBak, _context: SvgParserContextBak) {
        console.warn('<use> elements are not supported yet');
        // TODO
    }
}