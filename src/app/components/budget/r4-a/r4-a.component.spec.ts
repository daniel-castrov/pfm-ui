import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { R4AComponent } from './r4-a.component';

describe('R4AComponent', () => {
  let component: R4AComponent;
  let fixture: ComponentFixture<R4AComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ R4AComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(R4AComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
