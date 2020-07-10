import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FundsUpdateComponent } from './funds-update.component';

describe('FundsUpdateComponent', () => {
  let component: FundsUpdateComponent;
  let fixture: ComponentFixture<FundsUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FundsUpdateComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FundsUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
