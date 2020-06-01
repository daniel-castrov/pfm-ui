import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UfrRequestsDetailComponent } from './ufr-requests-detail.component';

describe('UfrRequestsDetailComponent', () => {
  let component: UfrRequestsDetailComponent;
  let fixture: ComponentFixture<UfrRequestsDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UfrRequestsDetailComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UfrRequestsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
