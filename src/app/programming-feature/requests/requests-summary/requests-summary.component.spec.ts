import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsSummaryComponent } from './requests-summary.component';

describe('RequestsSummaryComponent', () => {
  let component: RequestsSummaryComponent;
  let fixture: ComponentFixture<RequestsSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestsSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
