import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessChangeComponent } from './access-change.component';

describe('AccessChangeComponent', () => {
  let component: AccessChangeComponent;
  let fixture: ComponentFixture<AccessChangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessChangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
