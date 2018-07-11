import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

// Other Components
import { HeaderComponent } from '../../../../components/header/header.component';
import { GlobalsService } from '../../../../services/globals.service';

import { PomWorksheetService, POMService } from '../../../../generated';
import { Pom, PomWorksheet, PomWorksheetRow } from '../../../../generated';

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

  constructor( 
    private pomSvc:POMService,
    private pomWSSvc:PomWorksheetService,
    private globalsService: GlobalsService,
  ) { }

  ngOnInit() {

    this.globalsService.user().subscribe( user => {
      
      this.pomSvc.getOpen(user.currentCommunityId).subscribe( data => {
        this.pom = data.result;
        this.fy = this.pom.fy;
        this.pomWSSvc.getByPomId(this.pom.id).subscribe( data2 => {
          this.pomWorksheet = data2.result;
          this.rows = this.pomWorksheet[0].rows;
          console.log(this.rows);
        });

      });
    });



// this.pomWorksheet[0].rows.forEach( row => {
//   row.coreCapability
//   row.programRequestFullname
//   row.programRequestId
//   row.fund.appropriation
//   row.fund.baOrBlin
//   row.fund.item
//   row.fund.opAgency
//   row.fund.funds[this.fy]
//   row.fund.funds[this.fy+1]
//   row.fund.funds[this.fy+2]
//   row.fund.funds[this.fy+3]
//   row.fund.funds[this.fy+4]
//  });

  }

}
