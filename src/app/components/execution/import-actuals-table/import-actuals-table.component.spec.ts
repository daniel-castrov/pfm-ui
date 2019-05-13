import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportActualsTableComponent } from './import-actuals-table.component';

describe('ImportAcutalsTableComponent', () => {
  let component: ImportActualsTableComponent;
  let fixture: ComponentFixture<ImportActualsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImportActualsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportActualsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
