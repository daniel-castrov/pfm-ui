import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { R2TabComponent } from './r2-tab.component';

describe('R2TabComponent', () => {
  let component: R2TabComponent;
  let fixture: ComponentFixture<R2TabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ R2TabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(R2TabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
