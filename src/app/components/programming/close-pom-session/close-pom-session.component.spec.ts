import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClosePomSessionComponent } from './close-pom-session.component';

describe('OpenPomSessionComponent', () => {
  let component: ClosePomSessionComponent;
  let fixture: ComponentFixture<ClosePomSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClosePomSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClosePomSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
