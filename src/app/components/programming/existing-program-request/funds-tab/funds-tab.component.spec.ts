import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FundsTabComponent } from './funds-tab.component';

describe('FundsTabComponent', () => {
  let component: FundsTabComponent;
  let fixture: ComponentFixture<FundsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FundsTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FundsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
