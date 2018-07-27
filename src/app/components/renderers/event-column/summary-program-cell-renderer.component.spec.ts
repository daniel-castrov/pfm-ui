import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {SummaryProgramCellRenderer} from './summary-program-cell-renderer.component';

describe('SummaryProgramCellRenderer', () => {
  let component: SummaryProgramCellRenderer;
  let fixture: ComponentFixture<SummaryProgramCellRenderer>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryProgramCellRenderer ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryProgramCellRenderer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
