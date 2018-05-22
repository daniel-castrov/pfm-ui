import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UfrViewComponent } from './ufr-view.component';

describe('UfrViewComponent', () => {
  let component: UfrViewComponent;
  let fixture: ComponentFixture<UfrViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UfrViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UfrViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
