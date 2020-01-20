import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsFundingLineGridComponent } from './requests-funding-line-grid.component';

describe('RequestsFundingLineGridComponent', () => {
  let component: RequestsFundingLineGridComponent;
  let fixture: ComponentFixture<RequestsFundingLineGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestsFundingLineGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestsFundingLineGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
