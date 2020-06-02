import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UfrFormComponent } from './ufr-form.component';

describe('UfrFormComponent', () => {
  let component: UfrFormComponent;
  let fixture: ComponentFixture<UfrFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UfrFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UfrFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
