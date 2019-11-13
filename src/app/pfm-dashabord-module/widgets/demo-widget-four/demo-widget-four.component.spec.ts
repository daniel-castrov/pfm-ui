import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoWidgetFourComponent } from './demo-widget-four.component';

describe('DemoWidgetFourComponent', () => {
  let component: DemoWidgetFourComponent;
  let fixture: ComponentFixture<DemoWidgetFourComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemoWidgetFourComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoWidgetFourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
