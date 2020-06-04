import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UfrProgramFormComponent } from './ufr-program-form.component';

describe('UfrProgramFormComponent', () => {
  let component: UfrProgramFormComponent;
  let fixture: ComponentFixture<UfrProgramFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UfrProgramFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UfrProgramFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
