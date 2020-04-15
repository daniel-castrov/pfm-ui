import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseCommunityComponent } from './choose-community.component';

describe('ChooseCommunityComponent', () => {
  let component: ChooseCommunityComponent;
  let fixture: ComponentFixture<ChooseCommunityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChooseCommunityComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseCommunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
