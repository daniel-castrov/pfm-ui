import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProgramDetailsComponent } from './edit-program-details.component';

describe('EditBudgetScenarioComponent', () => {
  let component: EditProgramDetailsComponent;
  let fixture: ComponentFixture<EditProgramDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditProgramDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProgramDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
