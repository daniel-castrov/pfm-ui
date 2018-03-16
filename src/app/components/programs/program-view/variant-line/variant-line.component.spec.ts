import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantLineComponent } from './variant-line.component';

describe('VariantLineComponent', () => {
  let component: VariantLineComponent;
  let fixture: ComponentFixture<VariantLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VariantLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VariantLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
