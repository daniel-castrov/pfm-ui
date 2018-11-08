import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {WorksheetManagementComponent} from "../worksheet-management.component";


describe('UnlockComponent', () => {
  let component: WorksheetManagementComponent;
  let fixture: ComponentFixture<WorksheetManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorksheetManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksheetManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
