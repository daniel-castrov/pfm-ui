import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderMinimalComponent } from './header-minimal.component';

describe('HeaderNologinComponent', () => {
  let component: HeaderMinimalComponent;
  let fixture: ComponentFixture<HeaderMinimalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderMinimalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderMinimalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
