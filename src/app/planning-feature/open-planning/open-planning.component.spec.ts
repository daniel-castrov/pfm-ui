import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenPlanningComponent } from './open-planning.component';

describe('OpenPlanningComponent', () => {
  let component: OpenPlanningComponent;
  let fixture: ComponentFixture<OpenPlanningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OpenPlanningComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
