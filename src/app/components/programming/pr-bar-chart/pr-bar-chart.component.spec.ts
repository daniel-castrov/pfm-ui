import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrBarChartComponent } from './pr-bar-chart.component';

describe('PrBarChartComponent', () => {
  let component: PrBarChartComponent;
  let fixture: ComponentFixture<PrBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrBarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
