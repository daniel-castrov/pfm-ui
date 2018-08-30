import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UfrTabComponent } from './ufr-tab.component';

describe('UfrTabComponent', () => {
  let component: UfrTabComponent;
  let fixture: ComponentFixture<UfrTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UfrTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UfrTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
