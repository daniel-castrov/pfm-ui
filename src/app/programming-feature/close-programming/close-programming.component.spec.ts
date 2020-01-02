import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseProgrammingComponent } from './close-programming.component';

describe('CloseProgrammingComponent', () => {
  let component: CloseProgrammingComponent;
  let fixture: ComponentFixture<CloseProgrammingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseProgrammingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseProgrammingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
