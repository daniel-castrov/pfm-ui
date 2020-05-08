import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MprActionCellRendererComponent } from './mpr-action-cell-renderer.component';

describe('MprActionCellRendererComponent', () => {
  let component: MprActionCellRendererComponent;
  let fixture: ComponentFixture<MprActionCellRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MprActionCellRendererComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MprActionCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
