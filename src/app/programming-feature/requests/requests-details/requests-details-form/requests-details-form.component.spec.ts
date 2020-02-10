import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsDetailsFormComponent } from './requests-details-form.component';

describe('RequestsDetailsFormComponent', () => {
  let component: RequestsDetailsFormComponent;
  let fixture: ComponentFixture<RequestsDetailsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestsDetailsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestsDetailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
