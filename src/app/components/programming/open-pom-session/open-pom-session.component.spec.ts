import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenPomSessionComponent } from './open-pom-session.component';

describe('OpenPomSessionComponent', () => {
  let component: OpenPomSessionComponent;
  let fixture: ComponentFixture<OpenPomSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenPomSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenPomSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
