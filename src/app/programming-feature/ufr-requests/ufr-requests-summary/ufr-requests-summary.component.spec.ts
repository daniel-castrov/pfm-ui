import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UfrRequestsSummaryComponent } from './ufr-requests-summary.component';

describe('UfrRequestsSummaryComponent', () => {
  let component: UfrRequestsSummaryComponent;
  let fixture: ComponentFixture<UfrRequestsSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UfrRequestsSummaryComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UfrRequestsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
