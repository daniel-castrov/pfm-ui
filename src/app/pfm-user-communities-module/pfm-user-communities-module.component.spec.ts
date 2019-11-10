import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PfmUserCommunitiesModuleComponent } from './pfm-user-communities-module.component';

describe('PfmUserCommunitiesModuleComponent', () => {
  let component: PfmUserCommunitiesModuleComponent;
  let fixture: ComponentFixture<PfmUserCommunitiesModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PfmUserCommunitiesModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PfmUserCommunitiesModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
