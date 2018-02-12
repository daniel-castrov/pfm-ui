import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MamageCommunityDetailsComponent } from './manage-community-details.component';

describe('MamageCommunityDetailsComponent', () => {
  let component: MamageCommunityDetailsComponent;
  let fixture: ComponentFixture<MamageCommunityDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MamageCommunityDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MamageCommunityDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
