import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FundsUpdateActionCellRendererComponent } from './funds-update-action-cell-renderer.component';

describe('FundsUpdateActionCellRendererComponent', () => {
  let component: FundsUpdateActionCellRendererComponent;
  let fixture: ComponentFixture<FundsUpdateActionCellRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FundsUpdateActionCellRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FundsUpdateActionCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
