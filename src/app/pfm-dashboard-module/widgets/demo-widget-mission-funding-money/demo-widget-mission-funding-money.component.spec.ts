import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoWidgetMissionFundingMoneyComponent } from './demo-widget-mission-funding-money.component';

describe('DemoWidgetMissionFundingMoneyComponent', () => {
  let component: DemoWidgetMissionFundingMoneyComponent;
  let fixture: ComponentFixture<DemoWidgetMissionFundingMoneyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DemoWidgetMissionFundingMoneyComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoWidgetMissionFundingMoneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
