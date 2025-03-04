import { AbstractReferencedObject, Box2d, CoordSystem2d, CoordSystem2dData, EventObservable, Observable, ReadonlyBox2d, ReadonlyCoordSystem2d } from "@pluto/core";
import { Object2dPart } from "./object-2d-part";
import { Blend2dOperation } from "../../render";
import { Material2d } from "../../material";
import { RenderingContext2d } from "../../component/rendering-context-2d";

export interface Object2Data extends CoordSystem2dData {
    readonly alpha?: number;
    readonly blendOperation?: Blend2dOperation;
    readonly material?: Material2d;
    readonly visible?: boolean;
}

export class Object2d extends AbstractReferencedObject implements Object2dPart {

    alpha: number;
    blendOperation: Blend2dOperation | undefined;

    private readonly _onBoundingBoxChanged = new EventObservable<void>();
    private readonly _onVisibilityChanged = new EventObservable<void>();
    private readonly parts: Object2dPart[] = [];
    private readonly _boundingBox = Box2d.empty();

    private _material: Material2d | undefined;
    private _visible: boolean;
    private boundingBoxModified = false;
    private _coordSystem: CoordSystem2d;

    get boundingBox(): ReadonlyBox2d {
        if (this.boundingBoxModified) {
            this.calculateBoundingBox();
            this.boundingBoxModified = false;
        }
        return this._boundingBox;
    }

    get coordSystem(): ReadonlyCoordSystem2d {
        return this._coordSystem;
    }

    get material(): Material2d | undefined {
        return this._material;
    }

    set material(m: Material2d | undefined) {
        if (this._material !== m) {
            this._material?.releaseReference(this);
            this._material = m;
            this._material?.addReference(this);
        }
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

    set visible(v: boolean) {
        if (this._visible !== v) {
            this._visible = v;
            this._onVisibilityChanged.next();
        }
    }

    constructor(data?: Readonly<Object2Data>) {
        super();
        this._coordSystem = new CoordSystem2d(data);
        this.alpha = data?.alpha ?? 1;
        this.blendOperation = data?.blendOperation;
        this._visible = data?.visible ?? true;
        this._material = data?.material;
        this._material?.addReference(this);
    }

    updateCoordSystem(callback: (coordSystem: CoordSystem2d) => CoordSystem2d) {
        this._coordSystem = callback(this._coordSystem);
        this.updateBoundingBox();
    }

    add(obj: Object2dPart) {
        this.parts.push(obj);
        obj.addReference(this);
        obj.onBoundingBoxChanged.subscribe(this, () => {
            if (obj.visible) {
                this.updateBoundingBox();
            }
        });
        obj.onVisibilityChanged.subscribe(this, () => this.updateBoundingBox());
        if (obj.visible) {
            this.updateBoundingBox();
        }
    }

    render(): void {
        if (this._visible) {
            RenderingContext2d.renderSafely(ctx => {
                ctx.canvasRenderingContext.globalAlpha *= this.alpha;
                this.material?.use();
                ctx.canvasRenderingContext.transform(this._coordSystem.xAxis.x, this._coordSystem.yAxis.x, this._coordSystem.xAxis.y, this._coordSystem.yAxis.y, this._coordSystem.position.x, -this._coordSystem.position.y);
                if (this.blendOperation != undefined) {
                    ctx.canvasRenderingContext.globalCompositeOperation = this.blendOperation.value;
                }
                this.parts.forEach(it => it.render());
            });
        }
    }

    private calculateBoundingBox() {
        const bb = Box2d.empty();
        this.parts.forEach(it => {
            if (it.visible) {
                bb.extendByBox(it.boundingBox)
            }
        });
        this._boundingBox.setBoundingBox(this._coordSystem.localBoxToGlobal(bb));
    }

    protected onDelete() {
        this._material?.releaseReference(this);
        this.parts.forEach(it => {
            it.releaseReference(this);
            it.onBoundingBoxChanged.unsubscribe(this);
            it.onVisibilityChanged.unsubscribe(this);
        });
    }

    private updateBoundingBox() {
        if (!this.boundingBoxModified) {
            this.boundingBoxModified = true;
            this._onBoundingBoxChanged.next();
        }
    }
}