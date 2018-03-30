import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcQtyTabComponent } from './proc-qty-tab.component';

describe('ProcQtyTabComponent', () => {
  let component: ProcQtyTabComponent;
  let fixture: ComponentFixture<ProcQtyTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcQtyTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcQtyTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
