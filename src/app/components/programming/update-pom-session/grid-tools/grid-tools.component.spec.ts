import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridToolsComponent } from './grid-tools.component';

describe('EventsModalComponent', () => {
  let component: GridToolsComponent;
  let fixture: ComponentFixture<GridToolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridToolsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
