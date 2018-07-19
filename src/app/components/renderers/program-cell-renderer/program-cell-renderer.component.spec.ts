import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramCellRendererComponent } from './program-cell-renderer.component';

describe('ProgramCellRendererComponent', () => {
  let component: ProgramCellRendererComponent;
  let fixture: ComponentFixture<ProgramCellRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramCellRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
