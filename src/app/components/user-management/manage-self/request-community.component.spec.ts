import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestCommunityComponent } from './request-community.component';

describe('RequestCommunityComponent', () => {
  let component: RequestCommunityComponent;
  let fixture: ComponentFixture<RequestCommunityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestCommunityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestCommunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
