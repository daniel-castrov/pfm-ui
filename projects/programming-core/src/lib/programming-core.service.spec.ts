import { TestBed } from '@angular/core/testing';

import { ProgrammingCoreService } from './programming-core.service';

describe('ProgrammingCoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProgrammingCoreService = TestBed.get(ProgrammingCoreService);
    expect(service).toBeTruthy();
  });
});
