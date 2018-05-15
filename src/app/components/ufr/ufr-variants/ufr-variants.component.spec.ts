import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UfrVariantsComponent } from './ufr-variants.component';

describe('UfrVariantsComponent', () => {
  let component: UfrVariantsComponent;
  let fixture: ComponentFixture<UfrVariantsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UfrVariantsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UfrVariantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
