import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityJoinComponent } from './community-join.component';

describe('CommunityJoinComponent', () => {
  let component: CommunityJoinComponent;
  let fixture: ComponentFixture<CommunityJoinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunityJoinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityJoinComponent);
    component = fixture.componentInstance;CommunityJoinComponent
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
