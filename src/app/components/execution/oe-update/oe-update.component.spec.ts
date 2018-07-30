import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OeUpdateComponent } from './oe-update.component';

describe('OeUpdateComponent', () => {
  let component: OeUpdateComponent;
  let fixture: ComponentFixture<OeUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OeUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OeUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
