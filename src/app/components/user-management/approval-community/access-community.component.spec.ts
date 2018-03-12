import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessCommunityComponent } from './access-community.component';

describe('AccessCommunityComponent', () => {
  let component: AccessCommunityComponent;
  let fixture: ComponentFixture<AccessCommunityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessCommunityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessCommunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
