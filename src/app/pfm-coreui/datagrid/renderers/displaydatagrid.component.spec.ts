import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplaydatagridComponent } from './displaydatagrid.component';

describe('DisplaydatagridComponent', () => {
  let component: DisplaydatagridComponent;
  let fixture: ComponentFixture<DisplaydatagridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DisplaydatagridComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplaydatagridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
