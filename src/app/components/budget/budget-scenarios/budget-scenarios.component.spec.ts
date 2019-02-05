import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetScenariosComponent } from './budget-scenarios.component';

describe('BudgetScenariosComponent', () => {
  let component: BudgetScenariosComponent;
  let fixture: ComponentFixture<BudgetScenariosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BudgetScenariosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BudgetScenariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
