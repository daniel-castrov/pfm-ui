import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import {AgGridNg2} from 'ag-grid-angular';

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

   columnDefs = [
     {
       headerName: '',
       field: 'checkbox',
       width: 40
     },
     {
       headerName: 'Worksheet Name',
       field: 'worksheetName',
       width: 400
     },
     {
       headerName: 'Version',
       field: 'version',
       width: 100,

     },
     {
       headerName: 'Created',
       field: 'created',
       width: 140
     },
     {
       headerName: 'Last Updated',
       field: 'lastUpdated',
       width: 140
     }
   ];

   rowData = [
       {
         worksheetName: 'Worksheet POM 1',
         version: '1',
         created: '1/11/2017',
         lastUpdated: '1/12/2017'
       },
       {
        worksheetName: 'Worksheet POM 2',
         version: '2',
         created: '1/14/2017',
         lastUpdated: '1/15/2017'
       },
       {
        worksheetName: 'Worksheet POM 3',
         version: '3',
         created: '1/1/2018',
         lastUpdated: '1/1/2018'
       }
   ];

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
