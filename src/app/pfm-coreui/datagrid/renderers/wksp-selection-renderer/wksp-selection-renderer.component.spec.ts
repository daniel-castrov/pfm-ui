import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WkspSelectionRendererComponent } from './wksp-selection-renderer.component';

describe('WkspSelectionRendererComponent', () => {
  let component: WkspSelectionRendererComponent;
  let fixture: ComponentFixture<WkspSelectionRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WkspSelectionRendererComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WkspSelectionRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
