import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { R2AComponent } from './r2-a.component';

describe('R2AComponent', () => {
  let component: R2AComponent;
  let fixture: ComponentFixture<R2AComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ R2AComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(R2AComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
