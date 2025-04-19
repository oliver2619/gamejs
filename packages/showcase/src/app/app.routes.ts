import { Routes } from '@angular/router';
import { SvgComponent } from './svg/svg.component';
import { CanvasAdapter2dComponent } from './canvas-adapter2d/canvas-adapter2d.component';
import { Animations2dShowcase } from './showcases/animations-2d-showcase';
import { Physics2dShowcase } from './showcases/physics-2d-showcase';

export const routes: Routes = [{
    path: '',
    pathMatch: 'full',
    redirectTo: '/svg'
}, {
    path: 'animations2d',
    pathMatch: 'full',
    component: CanvasAdapter2dComponent,
    data: {showcase: Animations2dShowcase}
}, {
    path: 'physics2d',
    pathMatch: 'full',
    component: CanvasAdapter2dComponent,
    data: {showcase: Physics2dShowcase}
}, {
    path: 'svg',
    pathMatch: 'full',
    component: SvgComponent
}, {
    path: '**',
    redirectTo: '/'
}];
