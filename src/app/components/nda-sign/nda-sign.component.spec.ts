import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NdaSignComponent } from './nda-sign.component';

describe('NdaSignComponent', () => {
  let component: NdaSignComponent;
  let fixture: ComponentFixture<NdaSignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NdaSignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NdaSignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
