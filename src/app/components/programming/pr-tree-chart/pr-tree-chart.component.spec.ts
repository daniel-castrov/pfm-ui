import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrTreeChartComponent } from './pr-tree-chart.component';

describe('PrTreeChartComponent', () => {
  let component: PrTreeChartComponent;
  let fixture: ComponentFixture<PrTreeChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrTreeChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrTreeChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
