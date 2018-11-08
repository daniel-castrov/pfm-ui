import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenExecutionComponent } from './open-execution.component';

describe('OpenExecutionComponent', () => {
  let component: OpenExecutionComponent;
  let fixture: ComponentFixture<OpenExecutionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenExecutionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenExecutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
