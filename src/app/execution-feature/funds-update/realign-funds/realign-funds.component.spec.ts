import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RealignFundsComponent } from './realign-funds.component';

describe('RealignFundsComponent', () => {
  let component: RealignFundsComponent;
  let fixture: ComponentFixture<RealignFundsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RealignFundsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RealignFundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
