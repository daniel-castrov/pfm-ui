import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RdteTreeComponent } from './rdte-tree.component';

describe('RdteTreeComponent', () => {
  let component: RdteTreeComponent;
  let fixture: ComponentFixture<RdteTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RdteTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RdteTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
