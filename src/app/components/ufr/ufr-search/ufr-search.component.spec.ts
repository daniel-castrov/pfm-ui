import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UfrSearchComponent } from './ufr-search.component';

describe('UfrSearchComponent', () => {
  let component: UfrSearchComponent;
  let fixture: ComponentFixture<UfrSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UfrSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UfrSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
