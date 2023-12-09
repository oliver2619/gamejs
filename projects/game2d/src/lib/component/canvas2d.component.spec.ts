import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Canvas2dComponent } from './canvas2d.component';

describe('Canvas2dComponent', () => {
  let component: Canvas2dComponent;
  let fixture: ComponentFixture<Canvas2dComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Canvas2dComponent]
    });
    fixture = TestBed.createComponent(Canvas2dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
