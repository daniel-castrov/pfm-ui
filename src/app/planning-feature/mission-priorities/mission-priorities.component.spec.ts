import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionPrioritiesComponent } from './mission-priorities.component';

describe('MissionPrioritiesComponent', () => {
  let component: MissionPrioritiesComponent;
  let fixture: ComponentFixture<MissionPrioritiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MissionPrioritiesComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionPrioritiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
