import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JustificationTabComponent } from './justification-tab.component';

describe('JustificationTabComponent', () => {
  let component: JustificationTabComponent;
  let fixture: ComponentFixture<JustificationTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JustificationTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JustificationTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
