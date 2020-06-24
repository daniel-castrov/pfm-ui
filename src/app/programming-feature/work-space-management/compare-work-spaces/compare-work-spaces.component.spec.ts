import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareWorkSpacesComponent } from './compare-work-spaces.component';

describe('WorkSpaceManagementComponent', () => {
  let component: CompareWorkSpacesComponent;
  let fixture: ComponentFixture<CompareWorkSpacesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CompareWorkSpacesComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompareWorkSpacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
