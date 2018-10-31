import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FyHeaderComponent } from './fy-header.component';

describe('FyHeaderComponent', () => {
  let component: FyHeaderComponent;
  let fixture: ComponentFixture<FyHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FyHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FyHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
