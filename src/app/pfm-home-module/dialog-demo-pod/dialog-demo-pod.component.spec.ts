import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDemoPodComponent } from './dialog-demo-pod.component';

describe('DialogDemoPodComponent', () => {
  let component: DialogDemoPodComponent;
  let fixture: ComponentFixture<DialogDemoPodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogDemoPodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDemoPodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
