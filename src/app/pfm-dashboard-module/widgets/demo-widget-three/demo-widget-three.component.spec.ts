import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoWidgetThreeComponent } from './demo-widget-three.component';

describe('DemoWidgetThreeComponent', () => {
  let component: DemoWidgetThreeComponent;
  let fixture: ComponentFixture<DemoWidgetThreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemoWidgetThreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoWidgetThreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
