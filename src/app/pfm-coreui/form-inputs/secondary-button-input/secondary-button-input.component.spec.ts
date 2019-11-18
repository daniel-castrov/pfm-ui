import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondaryButtonInputComponent } from './secondary-button-input.component';

describe('SecondaryButtonInputComponent', () => {
  let component: SecondaryButtonInputComponent;
  let fixture: ComponentFixture<SecondaryButtonInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecondaryButtonInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondaryButtonInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
