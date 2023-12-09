import { RenderingContext2d } from "../../render/rendering-context2d";
import { Box2, EventObservable, GarbageCollectibleObject, ReadonlyBox2, ReadonlyVector2, ReferencedObject } from "projects/core/src/public-api";
import { Filter } from "../../render/filter";
import { CompositeOperation } from "../../render/composite-operation";
import { PathObject } from "../../render";
import { OcclusionTest } from "./occlusion-test";
import { BufferedLayer } from "../layer";

export interface Solid2Data {

    readonly visible?: boolean;
    readonly compositeOperation?: CompositeOperation;
    readonly clipPath?: PathObject;
}

export abstract class Solid2 implements ReferencedObject {

    readonly onBoundingBoxChanged = new EventObservable<void>();
    readonly onVisibilityChanged = new EventObservable<void>();

    readonly filter: Filter = new Filter();

    compositeOperation: CompositeOperation;

    // TODO shadow

    private readonly reference = new GarbageCollectibleObject(() => this.onDispose());
    private _visible: boolean;
    private boundingBoxModified = true;
    private _boundingBox: Box2 = Box2.empty();
    private _clipPath: PathObject | undefined;
    private occlusionTest: OcclusionTest | undefined;

    get boundingBox(): ReadonlyBox2 {
        if (this.boundingBoxModified) {
            this._boundingBox.clear();
            this.calculateBoundingBox(this._boundingBox);
            this.filter.extendBoundingBox(this._boundingBox);
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
            this.updateBoundingBox();
        }
    }

    get hasReferences(): boolean {
        return this.reference.hasReferences;
    }

    get visible(): boolean {
        return this._visible;
    }

    set visible(b: boolean) {
        if (this._visible !== b) {
            this._visible = b;
            this.onVisibilityChanged.produce();
        }
    }

    constructor(data: Solid2Data) {
        this._visible = data.visible == undefined ? true : data.visible;
        this.compositeOperation = data.compositeOperation == undefined ? CompositeOperation.NORMAL : data.compositeOperation;
        this._clipPath = data.clipPath;
        this.filter.onChangeBoundingBox.subscribe(() => this.updateBoundingBox());
    }

    addReference(holder: any) {
        this.reference.addReference(holder);
    }

    releaseReference(holder: any) {
        this.reference.releaseReference(holder);
    }

    render(context: RenderingContext2d) {
        if (this._visible) {
            if (this.occlusionTest != undefined) {
                this.occlusionTest.update(context.context);
                if (this.occlusionTest.alpha === 0) {
                    return;
                }
            }
            context.withFilter(this.filter, ctx => {
                if (this._clipPath != undefined) {
                    this._clipPath.clip('nonzero', ctx.context);
                }
                ctx.context.globalCompositeOperation = this.compositeOperation.value;
                if (this.occlusionTest != undefined) {
                    ctx.context.globalAlpha *= this.occlusionTest.alpha;
                }
                this.onRenderSafely(ctx);
            });
        }
    }

    setOcclusionTest(position: ReadonlyVector2 | undefined, layer: BufferedLayer) {
        if (position == undefined) {
            this.occlusionTest = undefined;
        } else {
            this.occlusionTest = new OcclusionTest({ layer, position });
        }
    }

    protected abstract calculateBoundingBox(box: Box2): void;

    protected abstract onDispose(): void;

    protected abstract onRenderSafely(context: RenderingContext2d): void;

    protected updateBoundingBox() {
        if (!this.boundingBoxModified) {
            this.boundingBoxModified = true;
            this.onBoundingBoxChanged.produce();
        }
    }
}