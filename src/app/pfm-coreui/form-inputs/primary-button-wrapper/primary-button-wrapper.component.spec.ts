import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimaryButtonWrapperComponent } from './primary-button-wrapper.component';

describe('PrimaryButtonWrapperComponent', () => {
  let component: PrimaryButtonWrapperComponent;
  let fixture: ComponentFixture<PrimaryButtonWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrimaryButtonWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrimaryButtonWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
