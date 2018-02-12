import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestAccessChangeComponent } from './request-access-change.component';

describe('RequestAccessChangeComponent', () => {
  let component: RequestAccessChangeComponent;
  let fixture: ComponentFixture<RequestAccessChangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestAccessChangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestAccessChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
