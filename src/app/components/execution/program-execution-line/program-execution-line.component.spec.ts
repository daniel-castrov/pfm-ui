import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramExecutionLineComponent } from './program-execution-line.component';

describe('ProgramExecutionLineComponent', () => {
  let component: ProgramExecutionLineComponent;
  let fixture: ComponentFixture<ProgramExecutionLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramExecutionLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramExecutionLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
