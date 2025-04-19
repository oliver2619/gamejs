import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasAdapter2dComponent } from './canvas-adapter2d.component';

describe('CanvasAdapter2dComponent', () => {
  let component: CanvasAdapter2dComponent;
  let fixture: ComponentFixture<CanvasAdapter2dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasAdapter2dComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasAdapter2dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
