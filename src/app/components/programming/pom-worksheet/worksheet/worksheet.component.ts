import {Component, OnInit, ViewChild} from '@angular/core';
import {HeaderComponent} from '../../../header/header.component';
import {UserUtils} from '../../../../services/user.utils';
import {Pom, POMService, Worksheet, WorksheetRow, WorksheetService} from '../../../../generated';
import {ProgramRequestWithFullName, WithFullNameService} from '../../../../services/with-full-name.service';

@Component({
  selector: 'app-worksheet',
  templateUrl: './worksheet.component.html',
  styleUrls: ['./worksheet.component.scss']
})
export class WorksheetComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  private worksheets:Worksheet[]=[];
  private pom:Pom;
  private fy;
  private rows;
  private fullnameMap;

  constructor( 
    private pomSvc:POMService,
    private pomWSSvc:WorksheetService,
    private globalsService: UserUtils,
    private withFullNameService:WithFullNameService
  ) { }

  ngOnInit() {
    this.globalsService.user().subscribe( user => {
      this.pomSvc.getOpen(user.currentCommunityId).subscribe( data => {
        this.pom = data.result;
        this.fy = this.pom.fy;
        this.pomWSSvc.getByPomId(this.pom.id).subscribe( data2 => {
          this.worksheets = data2.result;
          this.rows = this.worksheets[0].rows;
          //console.log(this.rows);
          this.initPbPrs();
        });
      });
    });``
  }

  async initPbPrs() {
    let pomProgrammaticRequests:ProgramRequestWithFullName[] =
       (await this.withFullNameService.programRequestsWithFullNamesDerivedFromCreationTimeData(this.pom.id));
       this.fullnameMap={};
       pomProgrammaticRequests.forEach( pr => {
        this.fullnameMap[pr.id] = pr.fullname;
       });
  }

  getFullName(row:WorksheetRow){
    try{
      return this.fullnameMap[row.programRequestId];
    }catch (ex) {
      return row.programRequestFullname;
    }
  }
}
