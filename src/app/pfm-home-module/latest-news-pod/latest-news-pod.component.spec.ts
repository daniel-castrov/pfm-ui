import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestNewsPodComponent } from './latest-news-pod.component';

describe('LatestNewsPodComponent', () => {
  let component: LatestNewsPodComponent;
  let fixture: ComponentFixture<LatestNewsPodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LatestNewsPodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LatestNewsPodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
