import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { P5aComponent } from './p5a.component';

describe('P5aComponent', () => {
  let component: P5aComponent;
  let fixture: ComponentFixture<P5aComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ P5aComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(P5aComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
