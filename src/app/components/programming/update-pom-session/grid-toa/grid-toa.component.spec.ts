import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePomSessionComponent } from './grid-toa.component';

describe('UpdatePomSessionComponent', () => {
  let component: UpdatePomSessionComponent;
  let fixture: ComponentFixture<UpdatePomSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdatePomSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdatePomSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
