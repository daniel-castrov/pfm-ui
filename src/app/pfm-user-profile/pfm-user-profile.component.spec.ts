import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PfmUserProfileComponent } from './pfm-user-profile-module.component';

describe('PfmUserProfileModuleComponent', () => {
  let component: PfmUserProfileComponent;
  let fixture: ComponentFixture<PfmUserProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PfmUserProfileComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PfmUserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
