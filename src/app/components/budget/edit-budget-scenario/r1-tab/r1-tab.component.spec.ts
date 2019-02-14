import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { R1TabComponent } from './r1-tab.component';

describe('R1TabComponent', () => {
  let component: R1TabComponent;
  let fixture: ComponentFixture<R1TabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ R1TabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(R1TabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
