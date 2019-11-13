import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoWidgetOneComponent } from './demo-widget-one.component';

describe('DemoWidgetOneComponent', () => {
  let component: DemoWidgetOneComponent;
  let fixture: ComponentFixture<DemoWidgetOneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemoWidgetOneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoWidgetOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
