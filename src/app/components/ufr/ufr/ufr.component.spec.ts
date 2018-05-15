import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UfrComponent } from './ufr.component';

describe('UfrComponent', () => {
  let component: UfrComponent;
  let fixture: ComponentFixture<UfrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UfrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UfrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
