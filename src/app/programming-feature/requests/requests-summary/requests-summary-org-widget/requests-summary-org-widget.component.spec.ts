import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsSummaryOrgWidgetComponent } from './requests-summary-org-widget.component';

describe('RequestsSummaryOrgWidgetComponent', () => {
  let component: RequestsSummaryOrgWidgetComponent;
  let fixture: ComponentFixture<RequestsSummaryOrgWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RequestsSummaryOrgWidgetComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestsSummaryOrgWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
