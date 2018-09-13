import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualsCellRendererComponent } from './actuals-cell-renderer.component';

describe('ActualsCellRendererComponent', () => {
  let component: ActualsCellRendererComponent;
  let fixture: ComponentFixture<ActualsCellRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActualsCellRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActualsCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
