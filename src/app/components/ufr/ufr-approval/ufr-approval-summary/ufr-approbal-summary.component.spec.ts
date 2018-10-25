import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {UfrApprovalSummaryComponent} from './ufr-approval-summary.component';

describe('UfrApprovalSummaryComponent', () => {
  let component: UfrApprovalSummaryComponent;
  let fixture: ComponentFixture<UfrApprovalSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UfrApprovalSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UfrApprovalSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
