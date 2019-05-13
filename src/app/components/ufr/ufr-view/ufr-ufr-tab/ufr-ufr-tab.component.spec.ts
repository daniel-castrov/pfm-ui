import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UfrUfrTabComponent } from './ufr-ufr-tab.component';

describe('UfrTabComponent', () => {
  let component: UfrUfrTabComponent;
  let fixture: ComponentFixture<UfrUfrTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UfrUfrTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UfrUfrTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
