import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramExportComponent } from './program-export.component';

describe('ProgramExportComponent', () => {
  let component: ProgramExportComponent;
  let fixture: ComponentFixture<ProgramExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramExportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
