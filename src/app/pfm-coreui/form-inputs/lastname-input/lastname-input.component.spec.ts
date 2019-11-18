import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LastnameInputComponent } from './lastname-input.component';

describe('LastnameInputComponent', () => {
  let component: LastnameInputComponent;
  let fixture: ComponentFixture<LastnameInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LastnameInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LastnameInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
