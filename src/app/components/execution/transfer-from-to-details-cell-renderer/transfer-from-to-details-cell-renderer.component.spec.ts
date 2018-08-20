import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferFromToDetailsCellRendererComponent } from './transfer-from-to-details-cell-renderer.component';

describe('TransferFromToDetailsCellRendererComponent', () => {
  let component: TransferFromToDetailsCellRendererComponent;
  let fixture: ComponentFixture<TransferFromToDetailsCellRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferFromToDetailsCellRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferFromToDetailsCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
