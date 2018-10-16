import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BesProcComponent } from './bes-proc.component';

describe('BesProcComponent', () => {
  let component: BesProcComponent;
  let fixture: ComponentFixture<BesProcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BesProcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BesProcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
