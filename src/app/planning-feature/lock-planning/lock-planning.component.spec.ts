import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LockPlanningComponent } from './lock-planning.component';

describe('LockPlanningComponent', () => {
  let component: LockPlanningComponent;
  let fixture: ComponentFixture<LockPlanningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LockPlanningComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LockPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
