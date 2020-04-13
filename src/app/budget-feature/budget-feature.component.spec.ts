import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetFeatureComponent } from './budget-feature.component';

describe('BudgetFeatureComponent', () => {
  let component: BudgetFeatureComponent;
  let fixture: ComponentFixture<BudgetFeatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BudgetFeatureComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BudgetFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
