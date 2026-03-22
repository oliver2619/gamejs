import { CanvasAdapterData, EventObservable, Observable, Vector2d } from "@pluto/core";

export interface ContextGpuConfig extends CanvasAdapterData {
    colorSpace?: 'display-p3' | 'srgb' | undefined;
    hdr?: boolean | undefined;
    name?: string | undefined;
}

export abstract class ContextGpu {

    private readonly _onLost = new EventObservable<string>();
    private readonly renderPipeline: GPURenderPipeline;

    readonly hdr: boolean;

    get canvasSize(): Vector2d {
        return new Vector2d(this.context.canvas.width, this.context.canvas.height);
    }

    get onLost(): Observable<string> {
        return this._onLost;
    }

    protected constructor(readonly context: GPUCanvasContext, readonly device: GPUDevice, config: ContextGpuConfig) {
        this.hdr = config.hdr ?? false;
        this.configure(config);
        const code = `
        @vertex fn main(@builtin(vertex_index) i : u32) -> @builtin(position) vec4<f32> {
            var pos = array<vec2<f32>, 6>(
                vec2(-1, -1),
                vec2(1, -1),
                vec2(-1, 1),
                vec2(-1, 1),
                vec2(1, -1),
                vec2(1, 1)
            );
            return vec4(pos[i], 0, 1);
        }

        @group(0) @binding(0) var tex : texture_2d<f32>;

        @fragment fn main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
            let uv = vec2<i32>(pos.xy);
            return textureLoad(tex, uv, 0);
        }
        `;
        const shaderModule = device.createShaderModule({
            code,
            label: `${device.label}.shaderModule`,
        });
        this.renderPipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: shaderModule,
                buffers: [{ arrayStride: 16, attributes: [{ format: 'float32x2', offset: 0, shaderLocation: 0 }, { format: 'float32x2', offset: 8, shaderLocation: 1 }], stepMode: 'vertex' }],
                entryPoint: 'vertexMain',
            },
            fragment: {
                module: shaderModule,
                targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }],
                entryPoint: 'fragmentMain',
            },
            label: `${device.label}.renderPipeline`,
            // multisample: {},
            primitive: { topology: 'triangle-strip', },
        });
        device.lost.then(info => {
            if (info.reason !== 'destroyed') {
                this.context.unconfigure();
                this._onLost.next(info.message);
            }
        });
    }

    private configure(config: ContextGpuConfig) {
        this.context.configure({
            device: this.device,
            format: navigator.gpu.getPreferredCanvasFormat(),
            alphaMode: 'opaque',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            colorSpace: config.colorSpace ?? 'srgb',
            toneMapping: { mode: config.hdr ? 'extended' : 'standard' },
        });
    }

    protected onDestroy() {
        this.device.destroy();
        this.context.unconfigure();
    }
}