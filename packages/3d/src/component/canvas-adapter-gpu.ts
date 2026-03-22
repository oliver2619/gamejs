import { CanvasAdapter, Observable } from "@pluto/core";
import { ContextGpu, ContextGpuConfig } from "../context/context-gpu";

class ContextGpuImpl extends ContextGpu {

    static create(context: GPUCanvasContext, config: ContextGpuConfig): Promise<ContextGpuImpl> {
        return navigator.gpu.requestAdapter({
            // powerPreference: 'low-power', // TODO use high power on non mobile devices
        }).then(adapter => {
            if (adapter != null) {
                // console.log(Array.from(adapter.features));
                return adapter.requestDevice({
                    defaultQueue: { label: config.name == undefined ? 'queue' : `${config.name}.queue` },
                    label: config.name == undefined ? 'device' : `${config.name}.device`,
                });
            } else {
                throw new Error('Failed to get adapter.');
            }
        }).then(device => {
            return new ContextGpuImpl(context, device, config);
        });
    }

    destroy() {
        this.onDestroy();
    }
}

export class CanvasAdapterGpu extends CanvasAdapter {

    readonly onContextLost: Observable<string>;

    get context(): ContextGpu {
        return this._context;
    }

    private constructor(canvas: HTMLCanvasElement, private readonly _context: ContextGpuImpl, config: ContextGpuConfig) {
        super(canvas, config);
        this.onContextLost = _context.onLost;
    }

    static create(canvas: HTMLCanvasElement, config: ContextGpuConfig): Promise<CanvasAdapterGpu> {
        const context = canvas.getContext('webgpu');
        if (context == null) {
            throw new Error('WebGPU not supported by this browser.');
        }
        return ContextGpuImpl.create(context, config).then(ctx => new CanvasAdapterGpu(canvas, ctx, config));
    }

    protected override onDestroy(): void {
        this._context.destroy();
    }

    protected override onRender(): void {

    }

    protected override onResize(): void {

    }
}