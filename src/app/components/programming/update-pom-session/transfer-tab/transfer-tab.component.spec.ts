import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferTabComponent } from './transfer-tab.component';

describe('TransferTabComponent', () => {
  let component: TransferTabComponent;
  let fixture: ComponentFixture<TransferTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
