import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectRequestDropdownComponent } from './select-request-dropdown.component';

describe('SelectRequestDropdownComponent', () => {
  let component: SelectRequestDropdownComponent;
  let fixture: ComponentFixture<SelectRequestDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectRequestDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectRequestDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
