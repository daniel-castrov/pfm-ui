import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoWidgetPrStatusComponent } from './demo-widget-pr-status.component';

describe('DemoWidgetPrStatusComponent', () => {
  let component: DemoWidgetPrStatusComponent;
  let fixture: ComponentFixture<DemoWidgetPrStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemoWidgetPrStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoWidgetPrStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
