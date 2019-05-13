import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { R3TabComponent } from './r3-tab.component';

describe('R3TabComponent', () => {
  let component: R3TabComponent;
  let fixture: ComponentFixture<R3TabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ R3TabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(R3TabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
