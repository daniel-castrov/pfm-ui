import {AfterContentChecked, ChangeDetectorRef, Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {HeaderComponent} from '../../../components/header/header.component';
import {Pom, Worksheet} from "../../../generated";
import {GridToaComponent} from "./grid-toa/grid-toa.component";
import {EventsModalComponent} from "./events-modal/events-modal.component";
import {WorksheetComponent} from "./worksheet/worksheet.component";
import {ReasonCodeComponent} from "./reason-code/reason-code.component";

@Component({
  selector: 'update-pom-session',
  templateUrl: './update-pom-session.component.html',
  styleUrls: ['./update-pom-session.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UpdatePomSessionComponent implements AfterContentChecked {

  @ViewChild(HeaderComponent) header;
  @ViewChild(WorksheetComponent) worksheetComponent: WorksheetComponent;
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
