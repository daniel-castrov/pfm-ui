import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportActualsComponent } from './import-actuals.component';

describe('ImportActualsComponent', () => {
  let component: ImportActualsComponent;
  let fixture: ComponentFixture<ImportActualsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportActualsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportActualsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
