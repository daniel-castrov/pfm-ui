import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderNologinComponent } from './header-nologin.component';

describe('HeaderNologinComponent', () => {
  let component: HeaderNologinComponent;
  let fixture: ComponentFixture<HeaderNologinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderNologinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderNologinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
