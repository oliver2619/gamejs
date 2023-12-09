import { TestBed } from '@angular/core/testing';

import { Game2dService } from './game2d.service';

describe('Game2dService', () => {
  let service: Game2dService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Game2dService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
