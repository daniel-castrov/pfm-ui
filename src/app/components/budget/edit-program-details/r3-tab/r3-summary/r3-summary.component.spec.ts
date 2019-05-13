import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { R3SummaryComponent } from './r3-summary.component';

describe('R3SummaryComponent', () => {
  let component: R3SummaryComponent;
  let fixture: ComponentFixture<R3SummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ R3SummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(R3SummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
