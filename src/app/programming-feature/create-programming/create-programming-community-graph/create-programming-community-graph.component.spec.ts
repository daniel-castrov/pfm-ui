import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProgrammingCommunityGraphComponent } from './create-programming-community-graph.component';

describe('CreateProgrammingCommunityGraphComponent', () => {
  let component: CreateProgrammingCommunityGraphComponent;
  let fixture: ComponentFixture<CreateProgrammingCommunityGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateProgrammingCommunityGraphComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateProgrammingCommunityGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
