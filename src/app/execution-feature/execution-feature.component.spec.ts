import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutionFeatureComponent } from './execution-feature.component';

describe('ExecutionFeatureComponent', () => {
  let component: ExecutionFeatureComponent;
  let fixture: ComponentFixture<ExecutionFeatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExecutionFeatureComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
