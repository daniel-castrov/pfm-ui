import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateTabComponent } from './calculate-tab.component';

describe('CalculateTabComponent', () => {
  let component: CalculateTabComponent;
  let fixture: ComponentFixture<CalculateTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculateTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculateTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
