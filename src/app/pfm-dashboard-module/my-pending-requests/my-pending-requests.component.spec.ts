import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPendingRequestsComponent } from './my-pending-requests.component';

describe('MyPendingRequestsComponent', () => {
  let component: MyPendingRequestsComponent;
  let fixture: ComponentFixture<MyPendingRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyPendingRequestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPendingRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
