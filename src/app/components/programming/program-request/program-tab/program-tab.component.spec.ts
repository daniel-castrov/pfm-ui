import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramTabComponent } from './program-tab.component';

describe('ProgramTabComponent', () => {
  let component: ProgramTabComponent;
  let fixture: ComponentFixture<ProgramTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
