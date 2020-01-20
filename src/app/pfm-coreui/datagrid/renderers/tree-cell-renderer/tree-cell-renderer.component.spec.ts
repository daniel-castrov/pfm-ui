import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeCellRendererComponent } from './tree-cell-renderer.component';

describe('TreeCellRendererComponent', () => {
  let component: TreeCellRendererComponent;
  let fixture: ComponentFixture<TreeCellRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeCellRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
