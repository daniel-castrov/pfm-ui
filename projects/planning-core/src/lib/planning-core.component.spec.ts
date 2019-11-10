import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningCoreComponent } from './planning-core.component';

describe('PlanningCoreComponent', () => {
  let component: PlanningCoreComponent;
  let fixture: ComponentFixture<PlanningCoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanningCoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanningCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
