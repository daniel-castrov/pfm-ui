import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSpendPlanComponent } from './add-spend-plan.component';

describe('AddSpendPlanComponent', () => {
  let component: AddSpendPlanComponent;
  let fixture: ComponentFixture<AddSpendPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSpendPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSpendPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
