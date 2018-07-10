import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutionLineTableComponent } from './execution-line-table.component';

describe('ExecutionLineTableComponent', () => {
  let component: ExecutionLineTableComponent;
  let fixture: ComponentFixture<ExecutionLineTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExecutionLineTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionLineTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
