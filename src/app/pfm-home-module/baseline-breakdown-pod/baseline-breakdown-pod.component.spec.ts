import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaselineBreakdownPodComponent } from './baseline-breakdown-pod.component';

describe('BaselineBreakdownPodComponent', () => {
  let component: BaselineBreakdownPodComponent;
  let fixture: ComponentFixture<BaselineBreakdownPodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaselineBreakdownPodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaselineBreakdownPodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
