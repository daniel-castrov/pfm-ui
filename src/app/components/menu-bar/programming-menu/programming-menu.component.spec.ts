import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {JHeaderComponent} from "../../header/j-header/j-header.component";


describe('JHeaderComponent', () => {
  let component: JHeaderComponent;
  let fixture: ComponentFixture<JHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
