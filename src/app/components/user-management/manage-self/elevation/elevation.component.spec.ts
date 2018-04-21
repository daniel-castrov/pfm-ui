import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSelfComponent } from './manage-self.component';

describe('ManageSelfComponent', () => {
  let component: ManageSelfComponent;
  let fixture: ComponentFixture<ManageSelfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageSelfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageSelfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
