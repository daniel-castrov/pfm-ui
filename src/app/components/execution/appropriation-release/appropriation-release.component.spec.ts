import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppropriationReleaseComponent } from './appropriation-release.component';

describe('AppropriationReleaseComponent', () => {
  let component: AppropriationReleaseComponent;
  let fixture: ComponentFixture<AppropriationReleaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppropriationReleaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppropriationReleaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
