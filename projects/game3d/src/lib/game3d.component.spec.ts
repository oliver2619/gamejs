import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Game3dComponent } from './game3d.component';

describe('Game3dComponent', () => {
  let component: Game3dComponent;
  let fixture: ComponentFixture<Game3dComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Game3dComponent]
    });
    fixture = TestBed.createComponent(Game3dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
