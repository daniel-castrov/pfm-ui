import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

// Other Components
import { HeaderComponent } from '../../../header/header.component';
import { UserUtils } from '../../../../services/user.utils';

import { PomWorksheetService, POMService } from '../../../../generated';
import { Pom, PomWorksheet, PomWorksheetRow } from '../../../../generated';



@Component({
  selector: 'worksheet-management',
  templateUrl: './worksheet-management.component.html',
  styleUrls: ['./worksheet-management.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WorksheetManagementComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  private pomWorksheet:PomWorksheet[]=[];
  private fy:number;

  constructor( 
    private pomSvc:POMService,
    private pomWSSvc:PomWorksheetService,
    private globalsService: UserUtils,

  ) { }



  ngOnInit() {

    this.globalsService.user().subscribe( user => {
      
      this.pomSvc.getOpen(user.currentCommunityId).subscribe( data => {
        let pom:Pom = data.result;
        this.fy = pom.fy;
        this.pomWSSvc.getByPomId(pom.id).subscribe( data2 => {
          this.pomWorksheet = data2.result;
          console.log(this.pomWorksheet);
        });

      });
    });


  }

}
