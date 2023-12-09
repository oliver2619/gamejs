import { TestBed } from '@angular/core/testing';

import { Game3dService } from './game3d.service';

describe('Game3dService', () => {
  let service: Game3dService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Game3dService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
