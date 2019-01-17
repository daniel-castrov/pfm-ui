import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PomAnalysisComponent } from './pom-analysis.component';

describe('PomAnalysisComponent', () => {
  let component: PomAnalysisComponent;
  let fixture: ComponentFixture<PomAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PomAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PomAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
