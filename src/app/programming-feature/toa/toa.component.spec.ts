import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToaComponent } from './toa.component';

describe('ToaComponent', () => {
  let component: ToaComponent;
  let fixture: ComponentFixture<ToaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
