import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramViewComponent } from './program-view.component';

describe('ProgramViewComponent', () => {
  let component: ProgramViewComponent;
  let fixture: ComponentFixture<ProgramViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
