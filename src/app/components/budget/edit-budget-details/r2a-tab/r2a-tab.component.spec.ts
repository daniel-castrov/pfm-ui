import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { R2aTabComponent } from './r2a-tab.component';

describe('R2aTabComponent', () => {
  let component: R2aTabComponent;
  let fixture: ComponentFixture<R2aTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ R2aTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(R2aTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
