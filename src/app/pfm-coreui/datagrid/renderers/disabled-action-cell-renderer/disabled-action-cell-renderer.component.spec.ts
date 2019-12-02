import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisabledActionCellRendererComponent } from './disabled-action-cell-renderer.component';

describe('DisabledActionCellRendererComponent', () => {
  let component: DisabledActionCellRendererComponent;
  let fixture: ComponentFixture<DisabledActionCellRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisabledActionCellRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisabledActionCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
