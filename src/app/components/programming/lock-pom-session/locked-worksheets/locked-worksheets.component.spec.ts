import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LockedWorksheetsComponent } from './locked-worksheets.component';

describe('EventsModalComponent', () => {
  let component: LockedWorksheetsComponent;
  let fixture: ComponentFixture<LockedWorksheetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LockedWorksheetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LockedWorksheetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
