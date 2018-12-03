import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LockPomSessionComponent } from './lock-pom-session.component';

describe('EventsModalComponent', () => {
  let component: LockPomSessionComponent;
  let fixture: ComponentFixture<LockPomSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LockPomSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LockPomSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
