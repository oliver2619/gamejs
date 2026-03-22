import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import './gpu';
import { CanvasAdapterGpu } from '@pluto/3d';
import { PromisesProgress } from '@pluto/core';

@Component({
  selector: 'sc-canvas-adapter3d',
  imports: [],
  templateUrl: './canvas-adapter3d.component.html',
  styleUrl: './canvas-adapter3d.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CanvasAdapter3dComponent implements AfterViewInit, OnDestroy {

  @ViewChild('canvas')
  canvas: ElementRef<HTMLCanvasElement> | undefined;

  private adapter: CanvasAdapterGpu | undefined;
  // private readonly showcase: Showcase3d;

  constructor(route: ActivatedRoute) {
    // const data: CanvasAdapter3dRouteData = route.snapshot.data as CanvasAdapter3dRouteData;
    // this.showcase = new data.showcase();
  }

  private run(device: GPUDevice, context: GPUCanvasContext) {
    const format = navigator.gpu.getPreferredCanvasFormat();
    const width = this.canvas!.nativeElement.width;
    const height = this.canvas!.nativeElement.height;
    const texture = device.createTexture({
      size: [width, height],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
    });
    const shader = device.createShaderModule({
      code: `
      @group(0) @binding(0)
      var img : texture_storage_2d<rgba8unorm, write>;

      @compute @workgroup_size(8,8)
      fn main(@builtin(global_invocation_id) id : vec3<u32>) {

          let size = textureDimensions(img);

          if (id.x >= size.x || id.y >= size.y) {
              return;
          }

          let r = f32(id.x) / f32(size.x);
          let g = f32(id.y) / f32(size.y);

          textureStore(
              img,
              vec2<i32>(id.xy),
              vec4<f32>(r, g, 1, 1)
          );
      }
      `
    });
    const pipeline = device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: shader,
        entryPoint: 'main',
      }
    });
    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [{
        binding: 0,
        resource: texture.createView(),
      }],
    });
    const encoder = device.createCommandEncoder();
    const computePass = encoder.beginComputePass();
    computePass.setPipeline(pipeline);
    computePass.setBindGroup(0, bindGroup);
    computePass.dispatchWorkgroups(Math.ceil(width / 8), Math.ceil(height / 8));
    computePass.end();

    const renderPipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: device.createShaderModule({
          code: `
              @vertex
              fn main(@builtin(vertex_index) i : u32)
              -> @builtin(position) vec4<f32> {
      
                  var pos = array<vec2<f32>,6>(
                      vec2(-1,-1),
                      vec2(1,-1),
                      vec2(-1,1),
                      vec2(-1,1),
                      vec2(1,-1),
                      vec2(1,1)
                  );
      
                  return vec4(pos[i],0,1);
              }
              `
        }),
        entryPoint: "main"
      },
      fragment: {
        module: device.createShaderModule({
          code: `
              @group(0) @binding(0)
              var tex : texture_2d<f32>;
      
              @fragment
              fn main(@builtin(position) pos: vec4<f32>)
              -> @location(0) vec4<f32> {
      
                  let uv = vec2<i32>(pos.xy);
                  return textureLoad(tex, uv, 0);
              }
              `
        }),
        entryPoint: "main",
        targets: [{ format }]
      },
      primitive: { topology: "triangle-list" }
    });

    const renderBindGroup = device.createBindGroup({
      layout: renderPipeline.getBindGroupLayout(0),
      entries: [{
        binding: 0,
        resource: texture.createView()
      }]
    });

    const renderPass = encoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        loadOp: "clear",
        storeOp: "store"
      }]
    });

    renderPass.setPipeline(renderPipeline);
    renderPass.setBindGroup(0, renderBindGroup);
    renderPass.draw(6);

    renderPass.end();

    device.queue.submit([encoder.finish()]);

  }

  ngAfterViewInit(): void {
    if (this.canvas != undefined) {
      CanvasAdapterGpu.create(this.canvas.nativeElement, {
        // alignTo: this.canvas.nativeElement.parentElement!,
      }).then(adapter => {
        this.adapter = adapter;
        this.run(adapter.context.device, adapter.context.context);
      });
    }
    PromisesProgress.onProgress.subscribe(this, ev => console.log(`Loaded: ${ev.loaded}, total: ${ev.total}.`))
  }

  ngOnDestroy(): void {
    if (this.adapter != undefined) {
      this.adapter.destroy();
    }
    PromisesProgress.onProgress.unsubscribe(this);
  }
}
