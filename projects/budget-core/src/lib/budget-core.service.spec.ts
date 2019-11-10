import { TestBed } from '@angular/core/testing';

import { BudgetCoreService } from './budget-core.service';

describe('BudgetCoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BudgetCoreService = TestBed.get(BudgetCoreService);
    expect(service).toBeTruthy();
  });
});
