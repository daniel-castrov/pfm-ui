import { Component, OnInit, ViewChild, Input } from '@angular/core';

// Other Components
import { HeaderComponent } from '../../../header/header.component';
import { UserUtils } from '../../../../services/user.utils.service';

import { PomWorksheetService, POMService } from '../../../../generated';
import { Pom, PomWorksheet, PomWorksheetRow } from '../../../../generated';

import { WithFullNameService } from '../../../../services/with-full-name.service';
import { ProgramRequestWithFullName } from '../../../../services/with-full-name.service';

@Component({
  selector: 'app-worksheet',
  templateUrl: './worksheet.component.html',
  styleUrls: ['./worksheet.component.scss']
})
export class WorksheetComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  private pomWorksheet:PomWorksheet[]=[];
  private pom:Pom;
  private fy;
  private rows;
  private fullnameMap;

  constructor( 
    private pomSvc:POMService,
    private pomWSSvc:PomWorksheetService,
    private globalsService: UserUtils,
    private withFullNameService:WithFullNameService
  ) { }

  ngOnInit() {
    this.globalsService.user().subscribe( user => {
      this.pomSvc.getOpen(user.currentCommunityId).subscribe( data => {
        this.pom = data.result;
        this.fy = this.pom.fy;
        this.pomWSSvc.getByPomId(this.pom.id).subscribe( data2 => {
          this.pomWorksheet = data2.result;
          this.rows = this.pomWorksheet[0].rows;
          //console.log(this.rows);
          this.initPbPrs();
        });
      });
    });
  }

  async initPbPrs() {
    let pomProgrammaticRequests:ProgramRequestWithFullName[] =
       (await this.withFullNameService.programRequestsWithFullNamesDerivedFromCreationTimeData(this.pom.id));
       this.fullnameMap={};
       pomProgrammaticRequests.forEach( pr => {
        this.fullnameMap[pr.id] = pr.fullname;
       });
  }

  getFullName(row:PomWorksheetRow){
    try{
      return this.fullnameMap[row.programRequestId];
    }catch (ex) {
      return row.programRequestFullname;
    }
  }
}
