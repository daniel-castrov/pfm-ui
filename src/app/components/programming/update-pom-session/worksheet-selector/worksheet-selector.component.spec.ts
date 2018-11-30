import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksheetSelectorComponent } from './worksheet-selector.component';

describe('EventsModalComponent', () => {
  let component: WorksheetSelectorComponent;
  let fixture: ComponentFixture<WorksheetSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorksheetSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksheetSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
