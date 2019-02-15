import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBudgetScenarioComponent } from './edit-budget-scenario.component';

describe('EditBudgetScenarioComponent', () => {
  let component: EditBudgetScenarioComponent;
  let fixture: ComponentFixture<EditBudgetScenarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditBudgetScenarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBudgetScenarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
