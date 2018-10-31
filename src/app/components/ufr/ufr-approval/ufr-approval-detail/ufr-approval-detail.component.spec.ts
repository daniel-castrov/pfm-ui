import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UfrApprovalDetailComponent } from './ufr-approval-detail.component';

describe('UfrApprovalDetailComponent', () => {
  let component: UfrApprovalDetailComponent;
  let fixture: ComponentFixture<UfrApprovalDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UfrApprovalDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UfrApprovalDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
