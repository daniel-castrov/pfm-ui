import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UfrFundsComponent } from './ufr-funds.component';

describe('UfrFundsComponent', () => {
  let component: UfrFundsComponent;
  let fixture: ComponentFixture<UfrFundsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UfrFundsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UfrFundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
