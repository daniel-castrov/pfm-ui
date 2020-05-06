import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WkspActionCellRendererComponent } from './wksp-action-cell-renderer.component';

describe('WkspActionCellRendererComponent', () => {
  let component: WkspActionCellRendererComponent;
  let fixture: ComponentFixture<WkspActionCellRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WkspActionCellRendererComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WkspActionCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
