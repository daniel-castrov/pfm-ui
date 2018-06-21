import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetEppComponent } from './set-epp.component';

describe('SetEppComponent', () => {
  let component: SetEppComponent;
  let fixture: ComponentFixture<SetEppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetEppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetEppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
