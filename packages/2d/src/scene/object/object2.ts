import { RenderingContext2d } from '../../render/rendering-context2d';
import { Box2, CoordSystem2, CoordSystem2Data, EventObservable, GarbageCollectibleObject, ReferencedObject } from 'core/src/index';
import { Solid2 } from "./solid2";

export interface Object2Data extends CoordSystem2Data {

    readonly alpha?: number;
}
export class Object2 extends CoordSystem2 implements ReferencedObject {

    alpha: number;

    readonly onBoundingBoxChanged = new EventObservable<void>();
    readonly onVisibilityChanged = new EventObservable<void>();

    private readonly solids: Solid2[] = [];
    private readonly objectsBack: Object2[] = [];
    private readonly objectsFront: Object2[] = [];
    private readonly reference = new GarbageCollectibleObject(() => this.onDispose());
    private readonly _boundingBox: Box2 = Box2.empty();

    private boundingBoxModified = false;
    private _visible: boolean = true;

    get boundingBox(): Box2 {
        if (this.boundingBoxModified) {
            this.calculateBoundingBox();
            this.boundingBoxModified = false;
        }
        return this._boundingBox;
    }

    get hasReferences(): boolean {
        return this.reference.hasReferences;
    }

    get visible(): boolean {
        return this._visible;
    }

    set visible(v: boolean) {
        if (this._visible !== v) {
            this._visible = v;
            this.onVisibilityChanged.produce();
        }
    }

    constructor(data: Object2Data) {
        super(data);
        this.alpha = data.alpha == undefined ? 1 : data.alpha;
        this.onModify.subscribe(() => this.updateBoundingBox());
    }

    addReference(holder: any) {
        this.reference.addReference(holder);
    }

    addObjectBack(obj: Object2) {
        this.objectsBack.push(obj);
        obj.addReference(this);
        obj.onBoundingBoxChanged.subscribeFor(this, () => {
            if (obj.visible) {
                this.updateBoundingBox();
            }
        });
        obj.onVisibilityChanged.subscribeFor(this, () => this.updateBoundingBox());
        if (obj.visible) {
            this.updateBoundingBox();
        }
    }

    addObjectFront(obj: Object2) {
        this.objectsFront.push(obj);
        obj.addReference(this);
        obj.onBoundingBoxChanged.subscribeFor(this, () => {
            if (obj.visible) {
                this.updateBoundingBox();
            }
        });
        obj.onVisibilityChanged.subscribeFor(this, () => this.updateBoundingBox());
        if (obj.visible) {
            this.updateBoundingBox();
        }
    }

    addSolid(solid: Solid2) {
        this.solids.push(solid);
        solid.addReference(this);
        solid.onBoundingBoxChanged.subscribeFor(this, () => {
            if (solid.visible) {
                this.updateBoundingBox();
            }
        });
        solid.onVisibilityChanged.subscribeFor(this, () => this.updateBoundingBox());
        if (solid.visible) {
            this.updateBoundingBox();
        }
    }

    releaseReference(holder: any) {
        this.reference.releaseReference(holder);
    }

    render(context: RenderingContext2d) {
        if (this._visible) {
            context.renderSafely(ctx => {
                ctx.context.globalAlpha *= this.alpha;
                ctx.context.transform(this._xAxis.x, this._yAxis.x, this._xAxis.y, this._yAxis.y, this._position.x, -this._position.y);
                this.objectsBack.forEach(it => it.render(ctx));
                this.solids.forEach(it => it.render(ctx));
                this.objectsFront.forEach(it => it.render(ctx));
            });
        }
    }

    private onDispose() {
        this.objectsBack.forEach(it => {
            it.releaseReference(this);
            it.onBoundingBoxChanged.unsubscribeAllForReceiver(this);
            it.onVisibilityChanged.unsubscribeAllForReceiver(this);
        });
        this.objectsFront.forEach(it => {
            it.releaseReference(this);
            it.onBoundingBoxChanged.unsubscribeAllForReceiver(this);
            it.onVisibilityChanged.unsubscribeAllForReceiver(this);
        });
        this.solids.forEach(it => {
            it.releaseReference(this);
            it.onBoundingBoxChanged.unsubscribeAllForReceiver(this);
            it.onVisibilityChanged.unsubscribeAllForReceiver(this);
        });
    }

    private calculateBoundingBox() {
        const bb = Box2.empty();
        this.solids.forEach(it => {
            if (it.visible) {
                bb.extendByBox(it.boundingBox)
            }
        });
        this._boundingBox.setBoundingBox(this.localBoxToGlobal(bb));
    }

    private updateBoundingBox() {
        if (!this.boundingBoxModified) {
            this.boundingBoxModified = true,
                this.onBoundingBoxChanged.produce();
        }
    }
}