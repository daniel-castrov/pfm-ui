import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PfmUserRolesModuleComponent } from './pfm-user-roles-module.component';

describe('PfmUserRolesModuleComponent', () => {
  let component: PfmUserRolesModuleComponent;
  let fixture: ComponentFixture<PfmUserRolesModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PfmUserRolesModuleComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PfmUserRolesModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
