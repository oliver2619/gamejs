import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasAdapter3dComponent } from './canvas-adapter3d.component';

describe('CanvasAdapter3dComponent', () => {
  let component: CanvasAdapter3dComponent;
  let fixture: ComponentFixture<CanvasAdapter3dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasAdapter3dComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasAdapter3dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
