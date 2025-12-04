import { TestBed } from '@angular/core/testing';

import { Donaciones } from './donaciones';

describe('Donaciones', () => {
  let service: Donaciones;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Donaciones);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
