import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PFormsComponent } from './p-forms.component';

describe('PFormsComponent', () => {
  let component: PFormsComponent;
  let fixture: ComponentFixture<PFormsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PFormsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
