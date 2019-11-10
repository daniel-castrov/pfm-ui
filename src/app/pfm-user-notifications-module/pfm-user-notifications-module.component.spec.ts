import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PfmUserNotificationsModuleComponent } from './pfm-user-notifications-module.component';

describe('PfmUserNotificationsModuleComponent', () => {
  let component: PfmUserNotificationsModuleComponent;
  let fixture: ComponentFixture<PfmUserNotificationsModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PfmUserNotificationsModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PfmUserNotificationsModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
