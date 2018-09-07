import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleLinkCellRendererComponent } from './simple-link-cell-renderer.component';

describe('EventDetailsCellRendererComponent', () => {
  let component: SimpleLinkCellRendererComponent;
  let fixture: ComponentFixture<SimpleLinkCellRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleLinkCellRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleLinkCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
