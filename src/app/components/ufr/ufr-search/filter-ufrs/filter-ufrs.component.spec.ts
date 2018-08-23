import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewUfrComponent } from './new-ufr.component';

describe('NewUfrComponent', () => {
  let component: NewUfrComponent;
  let fixture: ComponentFixture<NewUfrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewUfrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewUfrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
