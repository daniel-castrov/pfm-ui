import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyBudgetComponent } from './copy-budget.component';

describe('CopyBudgetComponent', () => {
  let component: CopyBudgetComponent;
  let fixture: ComponentFixture<CopyBudgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CopyBudgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
