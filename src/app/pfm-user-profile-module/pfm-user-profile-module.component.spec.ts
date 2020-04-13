import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PfmUserProfileModuleComponent } from './pfm-user-profile-module.component';

describe('PfmUserProfileModuleComponent', () => {
  let component: PfmUserProfileModuleComponent;
  let fixture: ComponentFixture<PfmUserProfileModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PfmUserProfileModuleComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PfmUserProfileModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
