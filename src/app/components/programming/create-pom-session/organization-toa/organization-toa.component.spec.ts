import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationToaComponent } from './organization-toa.component';

describe('OrganizationToaComponent', () => {
  let component: OrganizationToaComponent;
  let fixture: ComponentFixture<OrganizationToaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationToaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationToaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
