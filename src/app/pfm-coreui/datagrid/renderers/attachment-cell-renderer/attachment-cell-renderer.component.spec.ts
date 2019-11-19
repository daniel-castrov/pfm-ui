import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentCellRendererComponent } from './attachment-cell-renderer.component';

describe('AttachmentCellRendererComponent', () => {
  let component: AttachmentCellRendererComponent;
  let fixture: ComponentFixture<AttachmentCellRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttachmentCellRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachmentCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
