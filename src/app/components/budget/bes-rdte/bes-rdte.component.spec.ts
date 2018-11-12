import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BesRdteComponent } from './bes-rdte.component';

describe('RdteTreeComponent', () => {
  let component: BesRdteComponent;
  let fixture: ComponentFixture<BesRdteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BesRdteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BesRdteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
