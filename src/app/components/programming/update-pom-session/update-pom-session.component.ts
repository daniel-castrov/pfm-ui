import {AfterContentChecked, ChangeDetectorRef, Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {Pom, Worksheet, Workspace} from "../../../generated";
import {GridToaComponent} from "./grid-toa/grid-toa.component";
import {EventsModalComponent} from "./events-modal/events-modal.component";
import {WorksheetComponent} from "./worksheet/worksheet.component";
import {ReasonCodeComponent} from "./reason-code/reason-code.component";
import { WorkspaceComponent } from './workspace/workspace.component';

@Component({
  selector: 'update-pom-session',
  templateUrl: './update-pom-session.component.html',
  styleUrls: ['./update-pom-session.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UpdatePomSessionComponent implements AfterContentChecked {

  @ViewChild(WorksheetComponent) worksheetComponent: WorksheetComponent;
  @ViewChild(WorkspaceComponent) workspaceComponent: WorkspaceComponent;
  @ViewChild(GridToaComponent) gridToaComponent: GridToaComponent;
  @ViewChild(EventsModalComponent) eventsModalComponent: EventsModalComponent;
  @ViewChild(ReasonCodeComponent) reasonCodeComponent: ReasonCodeComponent;

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
