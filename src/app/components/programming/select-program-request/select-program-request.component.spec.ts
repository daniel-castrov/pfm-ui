import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectProgramRequestComponent } from './select-program-request.component';

describe('SelectProgramRequestComponent', () => {
  let component: SelectProgramRequestComponent;
  let fixture: ComponentFixture<SelectProgramRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectProgramRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectProgramRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
