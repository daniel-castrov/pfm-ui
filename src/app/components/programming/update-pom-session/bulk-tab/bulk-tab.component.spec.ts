import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkTabComponent } from './bulk-tab.component';

describe('BulkTabComponent', () => {
  let component: BulkTabComponent;
  let fixture: ComponentFixture<BulkTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
