import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCurrentActivityPodComponent } from './my-current-activity-pod.component';

describe('MyCurrentActivityPodComponent', () => {
  let component: MyCurrentActivityPodComponent;
  let fixture: ComponentFixture<MyCurrentActivityPodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyCurrentActivityPodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyCurrentActivityPodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
