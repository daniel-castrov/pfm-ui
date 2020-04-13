import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProgrammingOrganizationGraphComponent } from './create-programming-organization-graph.component';

describe('CreateProgrammingOrganizationGraphComponent', () => {
  let component: CreateProgrammingOrganizationGraphComponent;
  let fixture: ComponentFixture<CreateProgrammingOrganizationGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateProgrammingOrganizationGraphComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateProgrammingOrganizationGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
