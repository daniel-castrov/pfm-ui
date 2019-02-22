import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportAcutalsTableComponent } from './import-acutals-table.component';

describe('ImportAcutalsTableComponent', () => {
  let component: ImportAcutalsTableComponent;
  let fixture: ComponentFixture<ImportAcutalsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportAcutalsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportAcutalsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
