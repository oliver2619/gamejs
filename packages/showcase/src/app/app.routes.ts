import { Routes } from '@angular/router';
import { SvgComponent } from './svg/svg.component';
import { CanvasAdapter2dComponent } from './canvas-adapter2d/canvas-adapter2d.component';
import { Animations2dShowcase } from './showcases/animations-2d-showcase';
import { Physics2dShowcase } from './showcases/physics-2d-showcase';
import { CanvasAdapter3dComponent } from './canvas-adapter3d/canvas-adapter3d.component';
import { Basic3dShowcase } from './showcases/basic-3d-showcase';

export const routes: Routes = [{
    path: '',
    pathMatch: 'full',
    redirectTo: '/3d/basic'
}, {
    path: '2d/animations',
    pathMatch: 'full',
    component: CanvasAdapter2dComponent,
    data: {showcase: Animations2dShowcase}
}, {
    path: '2d/physics',
    pathMatch: 'full',
    component: CanvasAdapter2dComponent,
    data: {showcase: Physics2dShowcase}
}, {
    path: '2d/svg',
    pathMatch: 'full',
    component: SvgComponent
}, {
    path: '3d/basic',
    pathMatch: 'full',
    component: CanvasAdapter3dComponent,
    data: {showcase: Basic3dShowcase},
}, {
    path: '**',
    redirectTo: '/'
}];
