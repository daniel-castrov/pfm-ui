import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReasonCodeComponent } from './reason-code.component';

describe('EventsModalComponent', () => {
  let component: ReasonCodeComponent;
  let fixture: ComponentFixture<ReasonCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReasonCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReasonCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
