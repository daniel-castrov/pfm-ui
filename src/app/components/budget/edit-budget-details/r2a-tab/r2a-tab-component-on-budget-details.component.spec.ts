import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { R2aTabComponentOnBudgetDetails } from './r2a-tab-component-on-budget-details.component';

describe('R2aTabComponentOnBudgetDetails', () => {
  let component: R2aTabComponentOnBudgetDetails;
  let fixture: ComponentFixture<R2aTabComponentOnBudgetDetails>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ R2aTabComponentOnBudgetDetails ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(R2aTabComponentOnBudgetDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
