import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpendPlansTabComponent } from './spend-plans-tab.component';

describe('SpendPlansTabComponent', () => {
  let component: SpendPlansTabComponent;
  let fixture: ComponentFixture<SpendPlansTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpendPlansTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpendPlansTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
