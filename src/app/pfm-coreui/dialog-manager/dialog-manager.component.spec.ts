import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogManagerComponent } from './dialog-manager.component';

describe('DialogManagerComponent', () => {
  let component: DialogManagerComponent;
  let fixture: ComponentFixture<DialogManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
