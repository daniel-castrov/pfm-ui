import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDetailsCellRendererComponent } from './event-details-cell-renderer.component';

describe('EventDetailsCellRendererComponent', () => {
  let component: EventDetailsCellRendererComponent;
  let fixture: ComponentFixture<EventDetailsCellRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventDetailsCellRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventDetailsCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
