import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetCoreComponent } from './budget-core.component';

describe('BudgetCoreComponent', () => {
  let component: BudgetCoreComponent;
  let fixture: ComponentFixture<BudgetCoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BudgetCoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BudgetCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
