import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicaterComponent } from './duplicater.component';

describe('DuplicaterComponent', () => {
  let component: DuplicaterComponent;
  let fixture: ComponentFixture<DuplicaterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DuplicaterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicaterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
