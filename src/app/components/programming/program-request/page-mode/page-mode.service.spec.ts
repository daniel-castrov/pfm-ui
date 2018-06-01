import { TestBed, inject } from '@angular/core/testing';

import { ProgramRequestPageModeService } from './page-mode.service';

describe('ProgramRequestModeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProgramRequestPageModeService]
    });
  });

  it('should be created', inject([ProgramRequestPageModeService], (service: ProgramRequestPageModeService) => {
    expect(service).toBeTruthy();
  }));
});
