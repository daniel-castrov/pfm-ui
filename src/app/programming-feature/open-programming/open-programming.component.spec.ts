import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenProgrammingComponent } from './open-programming.component';

describe('OpenProgrammingComponent', () => {
  let component: OpenProgrammingComponent;
  let fixture: ComponentFixture<OpenProgrammingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenProgrammingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenProgrammingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
