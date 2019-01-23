import {AfterContentChecked, ChangeDetectorRef, Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {HeaderComponent} from '../../../components/header/header.component';
import {Pom, Worksheet} from "../../../generated";
import {GridToaComponent} from "./../update-pom-session/grid-toa/grid-toa.component";
import {EventsModalComponent} from "./../update-pom-session/events-modal/events-modal.component";
import {WorksheetComponent} from "./../update-pom-session/worksheet/worksheet.component";
import {ReasonCodeComponent} from "./../update-pom-session/reason-code/reason-code.component";
import {LockedWorksheetsComponent} from "./locked-worksheets/locked-worksheets.component";

@Component({
  selector: 'lock-pom-session',
  templateUrl: './lock-pom-session.component.html',
  styleUrls: ['./lock-pom-session.component.scss'],
})
export class LockPomSessionComponent implements AfterContentChecked {

  @ViewChild(HeaderComponent) header;
  @ViewChild(WorksheetComponent) worksheetComponent: WorksheetComponent;
  @ViewChild(LockedWorksheetsComponent) lockedWorksheetsComponent: LockedWorksheetsComponent;
  @ViewChild(GridToaComponent) gridToaComponent: GridToaComponent;
  @ViewChild(EventsModalComponent) eventsModalComponent: EventsModalComponent;
  @ViewChild(ReasonCodeComponent) private reasonCodeComponent: ReasonCodeComponent;

  pom: Pom;
  columnKeys;
  worksheets: Array<Worksheet>;
  selectedWorksheet: Worksheet;

  constructor(private cd: ChangeDetectorRef) {}

  ngAfterContentChecked() {
    this.cd.detectChanges();
  }

}
