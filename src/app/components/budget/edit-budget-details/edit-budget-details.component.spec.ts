import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBudgetDetailsComponent } from './edit-budget-details.component';

describe('EditBudgetScenarioComponent', () => {
  let component: EditBudgetDetailsComponent;
  let fixture: ComponentFixture<EditBudgetDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditBudgetDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBudgetDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
