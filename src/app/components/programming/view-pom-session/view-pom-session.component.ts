import {AfterContentChecked, ChangeDetectorRef, Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {HeaderComponent} from '../../../components/header/header.component';
import {Pom, Worksheet} from "../../../generated";
import {GridToaComponent} from "./../update-pom-session/grid-toa/grid-toa.component";
import {EventsModalComponent} from "./../update-pom-session/events-modal/events-modal.component";
import {WorksheetComponent} from "./../update-pom-session/worksheet/worksheet.component";
import {ReasonCodeComponent} from "./../update-pom-session/reason-code/reason-code.component";

@Component({
  selector: 'view-pom-session',
  templateUrl: './view-pom-session.component.html',
  styleUrls: ['./view-pom-session.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ViewPomSessionComponent implements AfterContentChecked {

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
