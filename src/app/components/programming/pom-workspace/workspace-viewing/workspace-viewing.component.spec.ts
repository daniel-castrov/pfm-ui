import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceViewingComponent } from './workspace-viewing.component';

describe('WorkspaceViewingComponent', () => {
  let component: WorkspaceViewingComponent;
  let fixture: ComponentFixture<WorkspaceViewingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspaceViewingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceViewingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
