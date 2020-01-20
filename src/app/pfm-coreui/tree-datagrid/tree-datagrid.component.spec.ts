import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeDatagridComponent } from './tree-datagrid.component';

describe('TreeDatagridComponent', () => {
  let component: TreeDatagridComponent;
  let fixture: ComponentFixture<TreeDatagridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeDatagridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeDatagridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
