import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimaryButtonInputComponent } from './primary-button-input.component';

describe('PrimaryButtonInputComponent', () => {
  let component: PrimaryButtonInputComponent;
  let fixture: ComponentFixture<PrimaryButtonInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrimaryButtonInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrimaryButtonInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
