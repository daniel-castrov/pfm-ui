import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateExecutionPhaseComponent } from './create-execution-phase.component';

describe('CreateExecutionPhaseComponent', () => {
  let component: CreateExecutionPhaseComponent;
  let fixture: ComponentFixture<CreateExecutionPhaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateExecutionPhaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateExecutionPhaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
