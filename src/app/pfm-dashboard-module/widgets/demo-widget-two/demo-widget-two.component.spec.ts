import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoWidgetTwoComponent } from './demo-widget-two.component';

describe('DemoWidgetTwoComponent', () => {
  let component: DemoWidgetTwoComponent;
  let fixture: ComponentFixture<DemoWidgetTwoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemoWidgetTwoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoWidgetTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
