import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WithholdComponent } from './withhold.component';

describe('WithholdComponent', () => {
  let component: WithholdComponent;
  let fixture: ComponentFixture<WithholdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WithholdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WithholdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
