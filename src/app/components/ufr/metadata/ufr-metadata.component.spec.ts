import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UfrMetadataComponent } from './ufr-metadata.component';

describe('UfrComponent', () => {
  let component: UfrMetadataComponent;
  let fixture: ComponentFixture<UfrMetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UfrMetadataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UfrMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
