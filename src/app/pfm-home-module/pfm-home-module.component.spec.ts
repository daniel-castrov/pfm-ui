import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PfmHomeModuleComponent } from './pfm-home-module.component';

describe('PfmHomeModuleComponent', () => {
  let component: PfmHomeModuleComponent;
  let fixture: ComponentFixture<PfmHomeModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PfmHomeModuleComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PfmHomeModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
