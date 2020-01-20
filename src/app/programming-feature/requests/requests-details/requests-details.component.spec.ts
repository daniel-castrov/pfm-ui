import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsDetailsComponent } from './requests-details.component';

describe('RequestsDetailsComponent', () => {
  let component: RequestsDetailsComponent;
  let fixture: ComponentFixture<RequestsDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestsDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
