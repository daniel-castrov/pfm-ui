import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoWidgetMissionFundingPriorityComponent } from './demo-widget-mission-funding-priority.component';

describe('DemoWidgetMissionFundingPriorityComponent', () => {
  let component: DemoWidgetMissionFundingPriorityComponent;
  let fixture: ComponentFixture<DemoWidgetMissionFundingPriorityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemoWidgetMissionFundingPriorityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoWidgetMissionFundingPriorityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
