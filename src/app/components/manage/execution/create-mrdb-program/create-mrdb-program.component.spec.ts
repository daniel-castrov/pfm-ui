import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMrdbProgramComponent } from './create-mrdb-program.component';

describe('CreateMrdbProgramComponent', () => {
  let component: CreateMrdbProgramComponent;
  let fixture: ComponentFixture<CreateMrdbProgramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateMrdbProgramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMrdbProgramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
