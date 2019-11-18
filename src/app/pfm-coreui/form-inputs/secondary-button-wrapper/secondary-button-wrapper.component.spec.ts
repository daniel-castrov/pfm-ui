import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondaryButtonWrapperComponent } from './secondary-button-wrapper.component';

describe('SecondaryButtonWrapperComponent', () => {
  let component: SecondaryButtonWrapperComponent;
  let fixture: ComponentFixture<SecondaryButtonWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecondaryButtonWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondaryButtonWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
