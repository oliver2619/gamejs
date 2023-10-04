import { RenderingContext2d } from "../../render/rendering-context2d";
import { Filter } from "../../render/filter";
import { Camera2 } from "../camera2";
import { Layer } from "./layer";
import { Object2 } from "../object/object2";
import { Box2, QuadTree } from "core/src/index";
import { Solid2 } from "../object/solid2";

class ObjectItem {

    constructor(readonly object: Object2, readonly usedBoundingBox: Box2, holder: any, onMove: (item: ObjectItem) => void) {
        object.addReference(holder);
        object.onBoundingBoxChanged.subscribeFor(holder, () => onMove(this));
    }

    remove(holder: any) {
        this.object.onBoundingBoxChanged.unsubscribeAllForReceiver(holder);
        this.object.releaseReference(holder);
    }
}

class SolidItem {

    constructor(readonly solid: Solid2, readonly usedBoundingBox: Box2, holder: any, onMove: (item: SolidItem) => void) {
        solid.addReference(holder);
        solid.onBoundingBoxChanged.subscribeFor(holder, () => onMove(this));
    }

    remove(holder: any) {
        this.solid.releaseReference(holder);
        this.solid.onBoundingBoxChanged.unsubscribeAllForReceiver(holder);
    }
}

export class ObjectLayer extends Layer {

    filter = new Filter();

    globalToLocalCamera: (globalCamera: Camera2, localCamera: Camera2) => void = (globalCamera, localCamera) => {
        localCamera.setCoordSystem(globalCamera);
        localCamera.zoom = globalCamera.zoom;
    };

    private readonly localCamera = new Camera2({});
    private readonly objectTree: QuadTree<ObjectItem> = new QuadTree(4);
    private readonly solidTree: QuadTree<SolidItem> = new QuadTree(4);

    addObject(obj: Object2) {
        const item = new ObjectItem(obj, obj.boundingBox.clone(), this, i => {
            this.objectTree.moveSolid(i, i.usedBoundingBox, i.object.boundingBox);
            i.usedBoundingBox.setBoundingBox(i.object.boundingBox);
        });
        this.objectTree.addSolid(item, item.usedBoundingBox);
    }

    addSolid(solid: Solid2) {
        const item = new SolidItem(solid, solid.boundingBox.clone(), this, i => {
            this.solidTree.moveSolid(i, i.usedBoundingBox, i.solid.boundingBox);
            i.usedBoundingBox.setBoundingBox(i.solid.boundingBox);
        });
        this.solidTree.addSolid(item, item.usedBoundingBox);
    }

    rebuild() {
        this.solidTree.rebuild();
        this.objectTree.rebuild(this.solidTree.boundingBox);
    }

    removeObject(obj: Object2) {
        const item = this.objectTree.removeAtBox(it => it.object === obj, obj.boundingBox);
        if (item != undefined) {
            item.remove(this);
        }
    }

    removeSolid(solid: Solid2) {
        const item = this.solidTree.removeAtBox(it => it.solid === solid, solid.boundingBox);
        if (item != undefined) {
            item.remove(this);
        }
    }

    preRender(_: RenderingContext2d, globalCamera: Camera2) {
        if (!this.visible) {
            return;
        }
        this.globalToLocalCamera(globalCamera, this.localCamera);
    }

    render(context: RenderingContext2d) {
        if (!this.visible) {
            return;
        }
        context.withFilter(this.filter, ctx => {
            this.localCamera.use(ctx);
            const bb = this.localCamera.boundingBox;
            this.solidTree.forEachInBox(bb, it => it.solid.render(ctx));
            this.objectTree.forEachInBox(bb, it => it.object.render(ctx));
        });
    }

    protected onDispose(): void {
        super.onDispose();
        this.objectTree.forEach(it => it.remove(this))
    }
}