import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgrammingCoreComponent } from './programming-core.component';

describe('ProgrammingCoreComponent', () => {
  let component: ProgrammingCoreComponent;
  let fixture: ComponentFixture<ProgrammingCoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgrammingCoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgrammingCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
