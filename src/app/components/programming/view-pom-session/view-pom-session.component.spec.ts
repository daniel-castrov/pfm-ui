import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPomSessionComponent } from './view-pom-session.component';

describe('EventsModalComponent', () => {
  let component: ViewPomSessionComponent;
  let fixture: ComponentFixture<ViewPomSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewPomSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPomSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
