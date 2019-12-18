import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProgrammingComponent } from './create-programming.component';

describe('CreateProgrammingComponent', () => {
  let component: CreateProgrammingComponent;
  let fixture: ComponentFixture<CreateProgrammingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateProgrammingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateProgrammingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
