import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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

  // private adapter: CanvasAdapter3d | undefined;
  // private readonly showcase: Showcase3d;

  constructor(route: ActivatedRoute) {
    // const data: CanvasAdapter3dRouteData = route.snapshot.data as CanvasAdapter3dRouteData;
    // this.showcase = new data.showcase();
  }

  ngAfterViewInit(): void {
    if (this.canvas != undefined) {
      // this.adapter = CanvasAdapter3d.create({
      //   canvas: this.canvas.nativeElement,
      //   alignTo: this.canvas.nativeElement.parentElement!,
      //   shaderPrecision: 'mediump',
      //   autoRender: true,
      // });
      // this.showcase.init(this.adapter);
      
    }
    // PromisesProgress.onProgress.subscribe(this, ev => console.log(`Loaded: ${ev.loaded}, total: ${ev.total}.`))
  }

  ngOnDestroy(): void {
    // if (this.adapter != undefined) {
    //   this.adapter.destroy();
    // }
    // PromisesProgress.onProgress.unsubscribe(this);
  }
}
