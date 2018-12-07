import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridRowsComponent } from './grid-rows.component';

describe('EventsModalComponent', () => {
  let component: GridRowsComponent;
  let fixture: ComponentFixture<GridRowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridRowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridRowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
