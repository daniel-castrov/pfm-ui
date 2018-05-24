import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePomSessionComponent } from './create-pom-session.component';

describe('CreatePomSessionComponent', () => {
  let component: CreatePomSessionComponent;
  let fixture: ComponentFixture<CreatePomSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreatePomSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePomSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
