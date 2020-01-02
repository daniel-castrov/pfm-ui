import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalAppropriationPriorityComponent } from './total-appropriation-priority.component';

describe('TotalAppropriationPriorityComponent', () => {
  let component: TotalAppropriationPriorityComponent;
  let fixture: ComponentFixture<TotalAppropriationPriorityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TotalAppropriationPriorityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalAppropriationPriorityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
