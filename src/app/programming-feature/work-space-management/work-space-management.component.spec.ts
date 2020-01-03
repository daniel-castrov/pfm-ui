import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkSpaceManagementComponent } from './work-space-management.component';

describe('WorkSpaceManagementComponent', () => {
  let component: WorkSpaceManagementComponent;
  let fixture: ComponentFixture<WorkSpaceManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkSpaceManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkSpaceManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
