import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZipcodeInputComponent } from './zipcode-input.component';

describe('ZipcodeInputComponent', () => {
  let component: ZipcodeInputComponent;
  let fixture: ComponentFixture<ZipcodeInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZipcodeInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZipcodeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
