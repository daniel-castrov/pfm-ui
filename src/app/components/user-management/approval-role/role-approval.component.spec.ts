import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessChangeApprovalComponent } from './role-approval.component';

describe('AccessChangeApprovalComponent', () => {
  let component: AccessChangeApprovalComponent;
  let fixture: ComponentFixture<AccessChangeApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessChangeApprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessChangeApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
