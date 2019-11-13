import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPodComponent } from './dashboard-pod.component';

describe('DashboardPodComponent', () => {
  let component: DashboardPodComponent;
  let fixture: ComponentFixture<DashboardPodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardPodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
