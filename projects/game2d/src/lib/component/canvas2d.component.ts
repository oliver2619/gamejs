import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Component2dAdapter, Component2dAdapterData } from './component2d-adapter';

@Component({
  selector: 'game2d-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './canvas2d.component.html'
})
export class Canvas2dComponent implements AfterViewInit {

  @Input('width')
  width: string | undefined;

  @Input('height')
  height: string | undefined;

  @Input('configuration')
  configuration: Component2dAdapterData | undefined;

  @Output('init')
  readonly onInit = new EventEmitter<Component2dAdapter>();

  @ViewChild('canvas')
  canvas: ElementRef<HTMLCanvasElement> | undefined

  ngAfterViewInit(): void {
    if(this.canvas != undefined) {
      const config: Component2dAdapterData = this.configuration == undefined ? {} : this.configuration;
      const adapter = Component2dAdapter.attach(this.canvas.nativeElement, config);
      this.onInit.emit(adapter);
    }
  }
}
