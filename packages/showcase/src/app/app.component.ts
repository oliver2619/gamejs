import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";
import { Color, ImageCache, ImageCacheAlphaOperation } from '@pluto/core';
import { Material2dCache } from '@pluto/2d';

@Component({
  selector: 'sc-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  ngOnInit(): void {
    ImageCache.register('pattern', 'pattern.jpg', ImageCacheAlphaOperation.KEEP_OPAQUE, 1);
    ImageCache.register('texture', 'texture.png', ImageCacheAlphaOperation.KEEP_TRANSPARENT, 1);
    Material2dCache.GLOBAL.registerColorStyle('green', new Color(0, 0.5, 0));
    Material2dCache.GLOBAL.registerColorStyle('white', new Color(1, 1, 1));
    Material2dCache.GLOBAL.registerPatternStyle('pattern', {
        image: 'pattern',
        scale: 0.2,
    });
    Material2dCache.GLOBAL.registerPatternStyle('texture', {
        image: 'texture',
    });
    Material2dCache.GLOBAL.registerMaterial('green', { fill: 'green', stroke: 'green' });
    Material2dCache.GLOBAL.registerMaterial('pattern', { fill: 'pattern', stroke: 'white' });
    Material2dCache.GLOBAL.registerMaterial('texture', { fill: 'texture', stroke: 'white' });
  }
}
