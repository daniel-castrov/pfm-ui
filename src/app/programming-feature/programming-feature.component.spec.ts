import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgrammingFeatureComponent } from './programming-feature.component';

describe('ProgrammingFeatureComponent', () => {
  let component: ProgrammingFeatureComponent;
  let fixture: ComponentFixture<ProgrammingFeatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgrammingFeatureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgrammingFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
