import { TestBed } from '@angular/core/testing';

import { PlanningCoreService } from './planning-core.service';

describe('PlanningCoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PlanningCoreService = TestBed.get(PlanningCoreService);
    expect(service).toBeTruthy();
  });
});
