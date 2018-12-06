import {Component, Input, OnInit} from '@angular/core';
import {POMService, WorksheetService} from "../../../../generated";
import {UserUtils} from "../../../../services/user.utils";
import {ActivatedRoute} from "@angular/router";
import {ViewPomSessionComponent} from "../view-pom-session.component";

@Component({
  selector: 'worksheet-selected',
  templateUrl: './worksheet-selected.component.html',
  styleUrls: ['./worksheet-selected.component.scss'],
})
export class WorksheetSelectedComponent implements OnInit {

  @Input() parent: ViewPomSessionComponent;

  constructor(private userUtils: UserUtils,
              private pomService: POMService,
              private worksheetService: WorksheetService,
              private route: ActivatedRoute) {}

  ngOnInit() {
    const worksheetId = this.route.snapshot.params['id'];
    this.userUtils.user().subscribe( user => {
      this.pomService.getReconciliation(user.currentCommunityId).subscribe( pom => {
        this.parent.pom = pom.result;
        this.parent.columnKeys = [
          this.parent.pom.fy - 3,
          this.parent.pom.fy -2,
          this.parent.pom.fy - 1,
          this.parent.pom.fy,
          this.parent.pom.fy + 1,
          this.parent.pom.fy + 2,
          this.parent.pom.fy + 3,
          this.parent.pom.fy + 4];
        this.worksheetService.getByPomId(pom.result.id).subscribe( worksheets => {
          this.parent.worksheets = worksheets.result;
          this.parent.selectedWorksheet = this.parent.worksheets.find(worksheet => worksheet.id === worksheetId);
          if (this.parent.selectedWorksheet !== undefined) {
            this.onWorksheetSelected();
          }
        });
      });
    });
  }

  onWorksheetSelected(){
    setTimeout(() => {
      this.parent.worksheetComponent.initRowClass();

      this.parent.worksheetComponent.initDataRows();
      this.parent.worksheetComponent.generateColumns();

      this.parent.gridToaComponent.initToaDataRows();
      this.parent.gridToaComponent.generateToaColumns();

      this.parent.eventsModalComponent.generateEventsColumns();
    });
  }

}
