import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnlockerComponent } from './unlocker.component';

describe('UnlockerComponent', () => {
  let component: UnlockerComponent;
  let fixture: ComponentFixture<UnlockerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnlockerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnlockerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
