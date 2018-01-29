import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuspendDeleteComponent } from './suspend-delete.component';

describe('SuspendDeleteComponent', () => {
  let component: SuspendDeleteComponent;
  let fixture: ComponentFixture<SuspendDeleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuspendDeleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuspendDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
