import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksheetSelectedComponent } from './worksheet-selected.component';

describe('EventsModalComponent', () => {
  let component: WorksheetSelectedComponent;
  let fixture: ComponentFixture<WorksheetSelectedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorksheetSelectedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksheetSelectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
