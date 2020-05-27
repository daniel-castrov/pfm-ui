import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UfrActionCellRendererComponent } from './ufr-action-cell-renderer.component';

describe('UfrActionCellRendererComponent', () => {
  let component: UfrActionCellRendererComponent;
  let fixture: ComponentFixture<UfrActionCellRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UfrActionCellRendererComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UfrActionCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
