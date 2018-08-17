import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutionLineDetailsComponent } from './execution-line-details.component';

describe('ExecutionLineDetailsComponent', () => {
  let component: ExecutionLineDetailsComponent;
  let fixture: ComponentFixture<ExecutionLineDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExecutionLineDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionLineDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
