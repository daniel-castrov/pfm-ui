import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsSummaryGridComponent } from './requests-summary-grid.component';

describe('RequestsSummaryGridComponent', () => {
  let component: RequestsSummaryGridComponent;
  let fixture: ComponentFixture<RequestsSummaryGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestsSummaryGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestsSummaryGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
