import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { R4aTabComponent } from './r4a-tab.component';

describe('R4aTabComponent', () => {
  let component: R4aTabComponent;
  let fixture: ComponentFixture<R4aTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ R4aTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(R4aTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
