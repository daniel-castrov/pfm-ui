import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioButtonWrapperComponent } from './radio-button-wrapper.component';

describe('RadioButtonWrapperComponent', () => {
  let component: RadioButtonWrapperComponent;
  let fixture: ComponentFixture<RadioButtonWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RadioButtonWrapperComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioButtonWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
