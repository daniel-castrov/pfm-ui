import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderStrangerComponent } from './header-stranger.component';

describe('HeaderNologinComponent', () => {
  let component: HeaderStrangerComponent;
  let fixture: ComponentFixture<HeaderStrangerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderStrangerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderStrangerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
