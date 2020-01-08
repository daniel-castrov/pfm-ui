import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsSummaryToaWidgetComponent } from './requests-summary-toa-widget.component';

describe('RequestsSummaryToaWidgetComponent', () => {
  let component: RequestsSummaryToaWidgetComponent;
  let fixture: ComponentFixture<RequestsSummaryToaWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestsSummaryToaWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestsSummaryToaWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
