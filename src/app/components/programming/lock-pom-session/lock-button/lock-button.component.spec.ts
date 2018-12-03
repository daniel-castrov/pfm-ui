import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LockButtonComponent } from './lock-button.component';

describe('EventsModalComponent', () => {
  let component: LockButtonComponent;
  let fixture: ComponentFixture<LockButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LockButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LockButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
