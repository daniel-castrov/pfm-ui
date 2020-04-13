import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UfrRequestsApprovalComponent } from './ufr-requests-approval.component';

describe('UfrRequestsApprovalComponent', () => {
  let component: UfrRequestsApprovalComponent;
  let fixture: ComponentFixture<UfrRequestsApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UfrRequestsApprovalComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UfrRequestsApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
