import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { P21Component } from './p21.component';

describe('P21Component', () => {
  let component: P21Component;
  let fixture: ComponentFixture<P21Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ P21Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(P21Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
