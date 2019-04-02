import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RenamerComponent } from './renamer.component';

describe('RenamerComponent', () => {
  let component: RenamerComponent;
  let fixture: ComponentFixture<RenamerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RenamerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenamerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
