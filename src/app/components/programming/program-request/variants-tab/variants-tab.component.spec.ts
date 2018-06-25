import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantsTabComponent } from './variants-tab.component';

describe('ProcQtyTabComponent', () => {
  let component: VariantsTabComponent;
  let fixture: ComponentFixture<VariantsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VariantsTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VariantsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
