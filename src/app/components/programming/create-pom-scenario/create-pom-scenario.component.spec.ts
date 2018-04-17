import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePomScenarioComponent } from './create-pom-scenario.component';

describe('CreatePomScenarioComponent', () => {
  let component: CreatePomScenarioComponent;
  let fixture: ComponentFixture<CreatePomScenarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatePomScenarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePomScenarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
