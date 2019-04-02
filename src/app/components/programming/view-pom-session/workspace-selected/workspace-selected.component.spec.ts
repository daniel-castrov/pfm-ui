import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceSelectedComponent } from './workspace-selected.component';

describe('WorkspaceSelectedComponent', () => {
  let component: WorkspaceSelectedComponent;
  let fixture: ComponentFixture<WorkspaceSelectedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspaceSelectedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceSelectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
