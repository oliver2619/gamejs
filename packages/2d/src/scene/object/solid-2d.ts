import { AbstractReferencedObject, Box2d, EventObservable, Observable, ReadonlyBox2d, ReadonlyVector2d } from "@pluto/core";
import { Filter, FilterStack } from "../../render/filter";
import { PathObject } from "../../render/path-object";
import { Object2dPart } from "./object-2d-part";
import { Blend2dOperation } from "../../render/blend-2d-operation";
import { OcclusionTest } from "./occlusion-test";
import { RenderingContext2d } from "../../component/rendering-context-2d";
import { BufferedLayer } from "../layer/buffered-layer";

export interface Solid2dData {
    alpha?: number | undefined;
    clipPath?: PathObject | undefined;
    blendOperation?: Blend2dOperation | undefined;
    filter?: Partial<Filter> | undefined;
    visible?: boolean | undefined;
    name?: string | undefined;
}

export abstract class Solid2d extends AbstractReferencedObject implements Object2dPart {

    readonly name: string | undefined;

    alpha: number;
    blendOperation: Blend2dOperation | undefined;

    // TODO shadow

    private readonly _onBoundingBoxChanged = new EventObservable<void>();
    private readonly _onVisibilityChanged = new EventObservable<void>();

    private _filter: Filter;
    private _visible: boolean;
    private boundingBoxModified = true;
    private _boundingBox = Box2d.empty();
    private _clipPath: PathObject | undefined;
    private occlusionTest: OcclusionTest | undefined;

    get boundingBox(): ReadonlyBox2d {
        if (this.boundingBoxModified) {
            this._boundingBox.clear();
            this.calculateBoundingBox(this._boundingBox);
            this._boundingBox.extendEveryDirection(this._filter.dropShadow);
            if (this._clipPath != undefined) {
                this._boundingBox.intersect(this._clipPath.boundingBox);
            }
            this.boundingBoxModified = false;
        }
        return this._boundingBox;
    }

    get clipPath(): PathObject | undefined {
        return this._clipPath;
    }

    set clipPath(p: PathObject | undefined) {
        if (this._clipPath !== p) {
            this._clipPath = p;
            this.setBoundingBoxModified();
        }
    }

    get filter(): Readonly<Filter> {
        return this._filter;
    }

    set filter(f: Readonly<Filter>) {
        this._filter = { ...f };
        this.setBoundingBoxModified();
    }

    get onBoundingBoxChanged(): Observable<void> {
        return this._onBoundingBoxChanged;
    }

    get onVisibilityChanged(): Observable<void> {
        return this._onVisibilityChanged;
    }

    get visible(): boolean {
        return this._visible;
    }

    set visible(b: boolean) {
        if (this._visible !== b) {
            this._visible = b;
            this._onVisibilityChanged.next();
        }
    }

    constructor(data: Readonly<Solid2dData>) {
        super();
        this.name = data.name;
        this.alpha = data.alpha ?? 1;
        this._clipPath = data.clipPath;
        this.blendOperation = data.blendOperation;
        this._visible = data.visible == undefined ? true : data.visible;
        this._filter = data.filter == undefined ? FilterStack.createDefaultFilter() : FilterStack.createPartialFilter(data.filter);
    }

    abstract clone(): Solid2d;

    render() {
        if (this._visible) {
            if (this.occlusionTest != undefined) {
                this.occlusionTest.update();
                if (this.occlusionTest.alpha <= 0) {
                    return;
                }
            }
            RenderingContext2d.withFilter(this._filter, ctx => {
                if (this._clipPath != undefined) {
                    this._clipPath.clip('nonzero');
                }
                if (this.blendOperation != undefined) {
                    ctx.canvasRenderingContext.globalCompositeOperation = this.blendOperation.value;
                }
                if (this.occlusionTest != undefined) {
                    ctx.canvasRenderingContext.globalAlpha *= this.occlusionTest.alpha * this.alpha;
                } else {
                    ctx.canvasRenderingContext.globalAlpha *= this.alpha;
                }
                this.onRenderSafely(ctx);
            });
        }
    }

    setNoOcclusionTest() {
        this.occlusionTest = undefined;
    }

    setOcclusionTest(position: ReadonlyVector2d, layer: BufferedLayer) {
        this.occlusionTest = new OcclusionTest({ layer, position });
    }

    protected abstract calculateBoundingBox(box: Box2d): void;

    protected abstract onRenderSafely(context: RenderingContext2d): void;

    protected setBoundingBoxModified() {
        if (!this.boundingBoxModified) {
            this.boundingBoxModified = true;
            this._onBoundingBoxChanged.next();
        }
    }
}