import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoWidgetPOMPhaseFundingComponent } from './demo-widget-pom-phase-funding.component';

describe('DemoWidgetPOMPhaseFundingComponent', () => {
  let component: DemoWidgetPOMPhaseFundingComponent;
  let fixture: ComponentFixture<DemoWidgetPOMPhaseFundingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DemoWidgetPOMPhaseFundingComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoWidgetPOMPhaseFundingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
