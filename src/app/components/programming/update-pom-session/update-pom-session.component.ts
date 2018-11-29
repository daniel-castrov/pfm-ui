import {ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {HeaderComponent} from '../../../components/header/header.component';
import {Pom, POMService, User, UserService, Worksheet, WorksheetService} from "../../../generated";
import {UserUtils} from "../../../services/user.utils";
import {Notify} from "../../../utils/Notify";
import {ActivatedRoute} from "@angular/router";
import {GridToaComponent} from "./grid-toa/grid-toa.component";
import {EventsModalComponent} from "./events-modal/events-modal.component";
import {WorksheetComponent} from "./worksheet/worksheet.component";

@Component({
  selector: 'update-pom-session',
  templateUrl: './update-pom-session.component.html',
  styleUrls: ['./update-pom-session.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UpdatePomSessionComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  @ViewChild(WorksheetComponent) private worksheetComponent: WorksheetComponent;
  @ViewChild(GridToaComponent) private gridToaComponent: GridToaComponent;
  @ViewChild(EventsModalComponent) private eventsModalComponent: EventsModalComponent;

  pom: Pom;
  user: User;
  columnDefs;
  columnKeys;
  worksheets: Array<Worksheet>;
  selectedWorksheet: Worksheet;

  constructor(private userUtils: UserUtils,
              private pomService: POMService,
              private worksheetService: WorksheetService,
              private route: ActivatedRoute,
              private userService: UserService,
              private cd: ChangeDetectorRef) {}

  ngOnInit() {
    let worksheetId = this.route.snapshot.params['id'];
    this.userUtils.user().subscribe( user => {
      this.user = user;
      this.pomService.getOpen(user.currentCommunityId).subscribe( pom => {
        this.pom = pom.result;
        this.columnKeys = [
          this.pom.fy - 3,
          this.pom.fy -2,
          this.pom.fy - 1,
          this.pom.fy,
          this.pom.fy + 1,
          this.pom.fy + 2,
          this.pom.fy + 3,
          this.pom.fy + 4];
        this.worksheetService.getByPomId(pom.result.id).subscribe( worksheets => {
          this.worksheets = worksheets.result.filter(worksheet => !worksheet.locked);
          this.selectedWorksheet = this.worksheets.find(worksheet => worksheet.id === worksheetId);
          if (this.selectedWorksheet !== undefined) {
            this.onWorksheetSelected();
          }
        });
      });
    });
  }


  lockPom(){
    this.worksheets.forEach(worksheet => {
      this.worksheetService.update({...worksheet, locked: true}).toPromise();
    });
    this.worksheetService.update({...this.selectedWorksheet, isFinal: true, locked: true}).subscribe(response => {
      this.worksheetService.updateProgramRequests(this.selectedWorksheet.id).subscribe(response => {
        this.pomService.updatePomStatus(this.pom.id, Pom.StatusEnum.RECONCILIATION).subscribe(response => {
          this.selectedWorksheet.isFinal = true;
          Notify.success('Worksheet marked as final successfully');
        })
      });
    });
  }

  onWorksheetSelected(){
    setTimeout(() => {
      this.worksheetComponent.initRowClass();

      this.worksheetComponent.initDataRows();
      this.worksheetComponent.generateColumns();

      this.gridToaComponent.initToaDataRows();
      this.gridToaComponent.generateToaColumns();

      this.eventsModalComponent.generateEventsColumns();
    });
    this.cd.detectChanges();
  }

  onGridReady(params) {
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    });
    window.addEventListener("resize", () => {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }
}
