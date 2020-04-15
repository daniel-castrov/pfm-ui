import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningFeatureComponent } from './planning-feature.component';

describe('PlanningFeatureComponent', () => {
  let component: PlanningFeatureComponent;
  let fixture: ComponentFixture<PlanningFeatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PlanningFeatureComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanningFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
