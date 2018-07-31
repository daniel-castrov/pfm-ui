import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualsTabComponent } from './actuals-tab.component';

describe('ActualsTabComponent', () => {
  let component: ActualsTabComponent;
  let fixture: ComponentFixture<ActualsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActualsTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActualsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
