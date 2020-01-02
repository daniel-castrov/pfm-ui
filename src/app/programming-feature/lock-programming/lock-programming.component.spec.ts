import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LockProgrammingComponent } from './lock-programming.component';

describe('LockProgrammingComponent', () => {
  let component: LockProgrammingComponent;
  let fixture: ComponentFixture<LockProgrammingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LockProgrammingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LockProgrammingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
