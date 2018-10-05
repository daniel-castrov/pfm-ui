import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestResultErrorComponent } from './restresult-error.component';

describe('RestResultErrorComponent', () => {
  let component: RestResultErrorComponent;
  let fixture: ComponentFixture<RestResultErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestResultErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestResultErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
