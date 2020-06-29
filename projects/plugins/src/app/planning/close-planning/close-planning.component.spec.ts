import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClosePlanningComponent } from './close-planning.component';

describe('ClosePlanningComponent', () => {
  let component: ClosePlanningComponent;
  let fixture: ComponentFixture<ClosePlanningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClosePlanningComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClosePlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
