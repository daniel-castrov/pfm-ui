import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomePodComponent } from './welcome-pod.component';

describe('WelcomePodComponent', () => {
  let component: WelcomePodComponent;
  let fixture: ComponentFixture<WelcomePodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WelcomePodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomePodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
