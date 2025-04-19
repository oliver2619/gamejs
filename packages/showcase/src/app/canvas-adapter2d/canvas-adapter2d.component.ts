import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { CanvasAdapter2d } from '@pluto/2d';
import { CanvasAdapter2dRouteData } from '../canvas-adapter2d-route-data';
import { Showcase2d } from '../showcase-2d';
import { PromisesProgress } from '@pluto/core';

@Component({
  selector: 'sc-canvas-adapter2d',
  imports: [],
  templateUrl: './canvas-adapter2d.component.html',
  styleUrl: './canvas-adapter2d.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CanvasAdapter2dComponent implements AfterViewInit, OnDestroy {

  @ViewChild('canvas')
  canvas: ElementRef<HTMLCanvasElement> | undefined;

  private adapter: CanvasAdapter2d | undefined;
  private readonly showcase: Showcase2d;

  constructor(route: ActivatedRoute) {
    const data: CanvasAdapter2dRouteData = route.snapshot.data as CanvasAdapter2dRouteData;
    this.showcase = new data.showcase();
  }

  ngAfterViewInit(): void {
    if (this.canvas != undefined) {
      this.adapter = CanvasAdapter2d.create({ canvas: this.canvas.nativeElement, alpha: false, alignTo: this.canvas.nativeElement.parentElement!, imageSmoothing: 'high' });
      this.showcase.init(this.adapter);
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
