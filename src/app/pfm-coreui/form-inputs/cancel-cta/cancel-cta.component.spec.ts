import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelCtaComponent } from './cancel-cta.component';

describe('CancelCtaComponent', () => {
  let component: CancelCtaComponent;
  let fixture: ComponentFixture<CancelCtaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CancelCtaComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelCtaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
