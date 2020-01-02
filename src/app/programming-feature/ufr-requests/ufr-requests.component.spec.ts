import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UfrRequestsComponent } from './ufr-requests.component';

describe('UfrRequestsComponent', () => {
  let component: UfrRequestsComponent;
  let fixture: ComponentFixture<UfrRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UfrRequestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UfrRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
