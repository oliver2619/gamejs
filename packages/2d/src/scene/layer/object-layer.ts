import { Box2d, QuadTree } from "@pluto/core";
import { Material2d } from "../../material";
import { Filter, FilterStack } from "../../render/filter";
import { Layer, LayerData } from "./layer";
import { Object2dPart, Object2dPartContainer } from "../object/object-2d-part";
import { Camera2d, ReadonlyCamera2d } from "../camera-2d";
import { RenderingContext2d } from "../../component/rendering-context-2d";
import { PhysicsSystem2d } from "../../physics/physics-system-2d";

class ObjectLayerElement {

    constructor(readonly object: Object2dPart, readonly usedBoundingBox: Box2d, holder: any, onMove: (item: ObjectLayerElement) => void) {
        object.addReference(holder);
        object.onBoundingBoxChanged.subscribe(holder, () => onMove(this));
    }

    remove(holder: any) {
        this.object.onBoundingBoxChanged.unsubscribe(holder);
        this.object.releaseReference(holder);
    }
}

export interface ObjectLayerData extends LayerData {
    alpha?: number | undefined;
    filter?: Filter | undefined;
    material?: Material2d | undefined;
    physicsSystem?: PhysicsSystem2d | undefined;
    localCameraScale?: number | undefined;
}

export class ObjectLayer extends Layer implements Object2dPartContainer {

    alpha: number;
    filter: Filter;
    globalToLocalCamera: (globalCamera: ReadonlyCamera2d, localCamera: Camera2d) => void;
    physicsSystem: PhysicsSystem2d | undefined;

    private _material: Material2d | undefined;
    private readonly localCamera = new Camera2d();
    private readonly objectTree: QuadTree<ObjectLayerElement> = QuadTree.withMinimumNumberOfElements<ObjectLayerElement>(1000);

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

    constructor(data?: Readonly<ObjectLayerData>) {
        super(data);
        this.alpha = data?.alpha ?? 1;
        this.filter = data?.filter == undefined ? FilterStack.createDefaultFilter() : { ...data?.filter };
        this._material = data?.material;
        this._material?.addReference(this);
        this.physicsSystem = data?.physicsSystem;
        const scale = data?.localCameraScale ?? 1;
        this.globalToLocalCamera = (globalCamera, localCamera) => {
            localCamera.updateCoordSystem(it => it.setCoordSystem(globalCamera.coordSystem));
            localCamera.zoom = globalCamera.zoom * scale;
        };
    }

    addPart(part: Object2dPart) {
        const item = new ObjectLayerElement(part, part.boundingBox.clone(), this, i => {
            this.objectTree.moveSolid(i, i.usedBoundingBox, i.object.boundingBox);
            i.usedBoundingBox.setBoundingBox(i.object.boundingBox);
        });
        this.objectTree.addSolid(item, item.usedBoundingBox);
    }

    rebuild(minNumberOfElements?: number) {
        this.objectTree.rebuild({ minNumberOfElements });
    }

    removePart(part: Object2dPart) {
        const item = this.objectTree.removeAtBox(it => it.object === part, part.boundingBox);
        if (item == undefined) {
            throw new RangeError('Part not found.');
        }
        item.remove(this);
    }

    preRender(): void {
        if (this.visible) {
            this.globalToLocalCamera(RenderingContext2d.current.camera, this.localCamera);
        }
    }

    render(): void {
        if (this.visible) {
            RenderingContext2d.withFilter(this.filter, ctx => {
                ctx.canvasRenderingContext.globalAlpha *= this.alpha;
                this.material?.use();
                this.localCamera.use();
                const bb = this.localCamera.boundingBox;
                this.objectTree.forEachInBox(bb, it => it.object.render());
            });
        }
    }

    renderDebug(): void {
        if (this.physicsSystem != undefined) {
            RenderingContext2d.renderSafely(() => {
                this.localCamera.use();
                this.physicsSystem!.render();
            });
        }
    }

    setLocalCameraScale(scale: number) {
        this.globalToLocalCamera = (globalCamera, localCamera) => {
            localCamera.updateCoordSystem(it => it.setCoordSystem(globalCamera.coordSystem));
            localCamera.zoom = globalCamera.zoom * scale;
        };
    }

    protected override onDelete(): void {
        this._material?.releaseReference(this);
        this.objectTree.forEach(it => it.remove(this));
    }
}