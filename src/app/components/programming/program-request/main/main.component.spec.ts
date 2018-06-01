import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramRequestComponent } from './existing-program-request.component';

describe('ProgramRequestComponent', () => {
  let component: ProgramRequestComponent;
  let fixture: ComponentFixture<ProgramRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
