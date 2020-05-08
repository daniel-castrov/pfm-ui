import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxCellRendererComponent } from './checkbox-cell-renderer.component';

describe('CheckboxCellRendererComponent', () => {
  let component: CheckboxCellRendererComponent;
  let fixture: ComponentFixture<CheckboxCellRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CheckboxCellRendererComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
