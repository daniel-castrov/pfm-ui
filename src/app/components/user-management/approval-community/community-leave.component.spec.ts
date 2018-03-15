import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityLeaveComponent } from './community-leave.component';

describe('CommunityLeaveComponent', () => {
  let component: CommunityLeaveComponent;
  let fixture: ComponentFixture<CommunityLeaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunityLeaveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityLeaveComponent);
    component = fixture.componentInstance;CommunityLeaveComponent
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
