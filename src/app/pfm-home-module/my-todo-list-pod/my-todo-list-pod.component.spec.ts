import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTodoListPodComponent } from './my-todo-list-pod.component';

describe('MyTodoListPodComponent', () => {
  let component: MyTodoListPodComponent;
  let fixture: ComponentFixture<MyTodoListPodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyTodoListPodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyTodoListPodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
