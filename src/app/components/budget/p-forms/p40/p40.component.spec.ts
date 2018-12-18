import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { P40Component } from './p40.component';

describe('P40Component', () => {
  let component: P40Component;
  let fixture: ComponentFixture<P40Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ P40Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(P40Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
