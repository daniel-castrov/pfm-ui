import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UfrVariantsTabComponent } from './ufr-variants-tab.component';

describe('ProcQtyTabComponent', () => {
  let component: UfrVariantsTabComponent;
  let fixture: ComponentFixture<UfrVariantsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UfrVariantsTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UfrVariantsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
