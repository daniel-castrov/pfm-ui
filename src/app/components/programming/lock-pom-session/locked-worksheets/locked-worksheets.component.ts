import {Component, OnInit} from '@angular/core';
import {Pom, POMService, Worksheet, WorksheetService} from "../../../../generated";
import {UserUtils} from "../../../../services/user.utils";

@Component({
  selector: 'locked-worksheets',
  templateUrl: './locked-worksheets.component.html',
  styleUrls: ['./locked-worksheets.component.scss'],
})
export class LockedWorksheetsComponent implements OnInit {

  lockedWorksheets: Worksheet[]

  constructor(private userUtils: UserUtils,
              private pomService: POMService,
              private worksheetService: WorksheetService) {}

  async ngOnInit() {
    const user = await this.userUtils.user().toPromise();
    const pom = (await this.pomService.getOpen(user.currentCommunityId).toPromise()).result as Pom;
    const worksheets = (await this.worksheetService.getByPomId(pom.id).toPromise()).result as Worksheet[];
    this.lockedWorksheets = worksheets.filter(worksheet => worksheet.locked);
  }

}
