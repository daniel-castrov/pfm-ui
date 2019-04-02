import {AfterContentChecked, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {Pom, Worksheet, Workspace} from "../../../generated";
import {GridToaComponent} from "./../update-pom-session/grid-toa/grid-toa.component";
import {EventsModalComponent} from "./../update-pom-session/events-modal/events-modal.component";
import {WorksheetComponent} from "./../update-pom-session/worksheet/worksheet.component";
import {ReasonCodeComponent} from "./../update-pom-session/reason-code/reason-code.component";
import { WorkspaceComponent } from '../update-pom-session/workspace/workspace.component';

@Component({
  selector: 'view-pom-session',
  templateUrl: './view-pom-session.component.html',
  styleUrls: ['./view-pom-session.component.scss'],
})
export class ViewPomSessionComponent implements AfterContentChecked {

  @ViewChild(WorksheetComponent) worksheetComponent: WorksheetComponent;
  @ViewChild(WorkspaceComponent) workspaceComponent: WorkspaceComponent;
  @ViewChild(GridToaComponent) gridToaComponent: GridToaComponent;
  @ViewChild(EventsModalComponent) eventsModalComponent: EventsModalComponent;
  @ViewChild(ReasonCodeComponent) private reasonCodeComponent: ReasonCodeComponent;

  pom: Pom;
  columnKeys;
  worksheets: Array<Worksheet>;
  selectedWorksheet: Worksheet;
  workspaces: Array<Workspace>;
  selectedWorkspace: Workspace;

  constructor(private cd: ChangeDetectorRef) {}

  ngAfterContentChecked() {
    this.cd.detectChanges();
  }

}
