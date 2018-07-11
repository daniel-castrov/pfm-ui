import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

// Other Components
import { HeaderComponent } from '../../../../components/header/header.component';
import { GlobalsService } from '../../../../services/globals.service';

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

  constructor( 
    private pomSvc:POMService,
    private pomWSSvc:PomWorksheetService,
    private globalsService: GlobalsService,

  ) { }



  ngOnInit() {

    this.globalsService.user().subscribe( user => {
      
      this.pomSvc.getOpen(user.currentCommunityId).subscribe( data => {
        let pom:Pom = data.result;
        this.pomWSSvc.getByPomId(pom.id).subscribe( data2 => {
          this.pomWorksheet = data2.result;
          console.log(this.pomWorksheet);
        });

      });
    });


  }

}
