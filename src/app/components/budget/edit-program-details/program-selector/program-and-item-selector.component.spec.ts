import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { R2aTabComponentOnProgramDetails } from './program-and-item-selector.component';

describe('R2aTabComponentOnBudgetDetails', () => {
  let component: R2aTabComponentOnProgramDetails;
  let fixture: ComponentFixture<R2aTabComponentOnProgramDetails>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ R2aTabComponentOnProgramDetails ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(R2aTabComponentOnProgramDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
