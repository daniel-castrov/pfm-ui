import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveRequestsComponent } from './approve-requests.component';

describe('ApproveRequestsComponent', () => {
  let component: ApproveRequestsComponent;
  let fixture: ComponentFixture<ApproveRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveRequestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
