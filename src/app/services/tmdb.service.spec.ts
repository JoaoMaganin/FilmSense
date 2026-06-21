import { TestBed } from '@angular/core/testing';

import { TmdbService } from './tmdb.service';

describe('Tmdb', () => {
  let service: TmdbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TmdbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
