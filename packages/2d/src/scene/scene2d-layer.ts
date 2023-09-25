import {ReferencedObject, GarbageCollectibleObject} from 'core/src/index';
import {RenderingContext2d} from "../rendering-context2d";
import {Filter} from "../filter";
import {Camera2} from "./camera2";

export class Scene2dLayer implements ReferencedObject {

    filter = new Filter();
    globalToLocalCamera: (globalCamera: Camera2, localCamera: Camera2) => void = (globalCamera, localCamera) => {
        localCamera.setCoordSystem(globalCamera);
        localCamera.zoom = globalCamera.zoom;
    };

    private readonly reference = new GarbageCollectibleObject(() => this.onDispose());
    private readonly localCamera = new Camera2({});

    private ownContext: RenderingContext2d | undefined;

    get hasReferences(): boolean {
        return this.reference.hasReferences;
    }

    constructor(private readonly ownCanvas: boolean) {
    }

    addReference(holder: any) {
        this.reference.addReference(holder);
    }

    releaseReference(holder: any) {
        this.reference.releaseReference(holder);
    }

    render(context: RenderingContext2d, globalCamera: Camera2) {
        if (this.ownCanvas) {
            let changed = false;
            if (this.ownContext == undefined) {
                this.ownContext = context.duplicateWithNewCanvas();
                changed = true;
            }
            if (this.ownContext.context.canvas.width !== context.viewportSize.x || this.ownContext.context.canvas.height !== context.viewportSize.y) {
                this.ownContext.context.canvas.width = context.viewportSize.x
                this.ownContext.context.canvas.height = context.viewportSize.y;
                changed = true;
            }
            // TODO also draw if content changed!
            if (changed) {
                this.ownContext.renderFullSized(ctx => {
                    ctx.clear();
                    this.drawElements(ctx, globalCamera);
                });
            }
        }
        context.withFilter(this.filter, ctx => {
            if (this.ownContext != undefined) {
                ctx.context.drawImage(this.ownContext.context.canvas, 0, 0);
            } else {
                this.drawElements(ctx, globalCamera);
            }
        });
    }

    private drawElements(context: RenderingContext2d, globalCamera: Camera2) {
        this.globalToLocalCamera(globalCamera, this.localCamera);
        this.localCamera.use(context);

        // TODO render elements
    }

    private onDispose() {

    }
}