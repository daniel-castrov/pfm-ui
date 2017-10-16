import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutPrivateComponent } from './about-private.component';

describe('AboutPrivateComponent', () => {
  let component: AboutPrivateComponent;
  let fixture: ComponentFixture<AboutPrivateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AboutPrivateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutPrivateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
