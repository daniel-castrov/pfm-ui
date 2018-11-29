import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkChangesComponent } from './bulk-changes.component';

describe('EventsModalComponent', () => {
  let component: BulkChangesComponent;
  let fixture: ComponentFixture<BulkChangesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkChangesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkChangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
