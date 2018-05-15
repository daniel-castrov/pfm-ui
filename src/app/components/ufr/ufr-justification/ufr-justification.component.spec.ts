import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UfrJustificationComponent } from './ufr-justification.component';

describe('UfrJustificationComponent', () => {
  let component: UfrJustificationComponent;
  let fixture: ComponentFixture<UfrJustificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UfrJustificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UfrJustificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
